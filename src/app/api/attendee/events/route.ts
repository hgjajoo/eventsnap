import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/attendee/events — List all events the current user has accessed
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Not authenticated" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        // Get all event_attendees records for this user, joined with event data
        const { data, error } = await supabase
            .from("event_attendees")
            .select(`
                id,
                event_id,
                match_count,
                accessed_at,
                downloaded,
                downloaded_at,
                events!inner (
                    id,
                    name,
                    code,
                    date,
                    status,
                    photo_count
                )
            `)
            .eq("attendee_id", userId)
            .order("accessed_at", { ascending: false });

        if (error) throw error;

        // Flatten the response
        const events = (data || []).map((record: any) => ({
            id: record.event_id,
            name: record.events.name,
            code: record.events.code,
            date: record.events.date,
            status: record.events.status,
            photoCount: record.events.photo_count,
            matchCount: record.match_count || 0,
            accessedAt: record.accessed_at,
            downloaded: record.downloaded,
            downloadedAt: record.downloaded_at,
        }));

        return NextResponse.json({ success: true, events });
    } catch (err: unknown) {
        console.error("Attendee events error:", err);
        const message = err instanceof Error ? err.message : "Failed to fetch events";
        return NextResponse.json({ err: message }, { status: 500 });
    }
}
