import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { attendeeRegisterSchema } from "@/lib/validations";

// POST — Register attendee and grant access to event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = attendeeRegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        // Verify event code exists and is active
        const { data: event } = await supabase
            .from("events")
            .select("id, name, code, status")
            .eq("code", validation.data.eventCode)
            .single();

        if (!event) {
            return NextResponse.json(
                { err: "Invalid event code. Please check and try again." },
                { status: 404 }
            );
        }

        if (event.status !== "active") {
            return NextResponse.json(
                { err: "This event is no longer active." },
                { status: 400 }
            );
        }

        // Find or create attendee
        let attendee;
        const { data: existing } = await supabase
            .from("attendees")
            .select("id")
            .eq("email", validation.data.email)
            .single();

        if (existing) {
            attendee = existing;
        } else {
            const { data: created, error } = await supabase
                .from("attendees")
                .insert({
                    name: validation.data.name,
                    email: validation.data.email,
                })
                .select("id")
                .single();

            if (error) throw error;
            attendee = created;
        }

        // Check if already has access to this event
        const { data: existingAccess } = await supabase
            .from("event_attendees")
            .select("id")
            .eq("event_id", event.id)
            .eq("attendee_id", attendee!.id)
            .single();

        if (!existingAccess) {
            const { error: insertError } = await supabase
                .from("event_attendees")
                .insert({
                    event_id: event.id,
                    attendee_id: attendee!.id,
                });

            if (insertError) throw insertError;
        }

        return NextResponse.json({
            success: true,
            msg: "Access granted",
            attendeeId: attendee!.id,
            eventName: event.name,
            eventCode: event.code,
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
