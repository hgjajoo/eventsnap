import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createEventSchema } from "@/lib/validations";

// GET — List organizer's events (with attendee info)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        // Get user ID
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        // Get events
        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // For each event, fetch attendees via join table and dynamic photo count
        const enrichedEvents = await Promise.all(
            (events || []).map(async (event) => {
                // 1. Fetch attendance records
                const { data: attendeeRows, error: eaError } = await supabase
                    .from("event_attendees")
                    .select("attendee_id, downloaded, downloaded_at")
                    .eq("event_id", event.id);

                if (eaError) {
                    console.error(`[API/events] EA Query Error for ${event.id}:`, eaError);
                }

                const attendeeIds = (attendeeRows || []).map(r => r.attendee_id);

                // 2. Fetch user profiles separately to avoid broken join
                const { data: userProfiles } = attendeeIds.length > 0
                    ? await supabase.from("users").select("id, full_name, email").in("id", attendeeIds)
                    : { data: [] };

                const profileMap = (userProfiles || []).reduce((acc: any, u: any) => {
                    acc[u.id] = u;
                    return acc;
                }, {});

                const attendeesAccessed = (attendeeRows || []).map((row: any) => {
                    const u = profileMap[row.attendee_id];
                    return {
                        id: u?.id || row.attendee_id,
                        name: u?.full_name || "Attendee",
                        email: u?.email || "No email",
                        downloaded: row.downloaded,
                        downloadedAt: row.downloaded_at,
                    };
                });

                return { ...event, attendeesAccessed };
            })
        );

        return NextResponse.json({ events: enrichedEvents, success: true });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// POST — Create a new event
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = createEventSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        // Generate unique 6-char code
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        let codeExists = true;
        while (codeExists) {
            code = "";
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const { data: existing } = await supabase
                .from("events")
                .select("id")
                .eq("code", code)
                .single();
            codeExists = !!existing;
        }

        const { data: event, error } = await supabase
            .from("events")
            .insert({
                name: validation.data.name,
                description: validation.data.description || "",
                date: validation.data.date || null,
                code,
                owner_id: user.id,
                status: "active",
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(
            { event, success: true, msg: "Event created successfully" },
            { status: 201 }
        );
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
