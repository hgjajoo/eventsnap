import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST — Mark an attendee as having downloaded photos for an event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { attendeeId, eventId } = body;

        if (!attendeeId || !eventId) {
            return NextResponse.json(
                { err: "attendeeId and eventId are required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("event_attendees")
            .update({
                downloaded: true,
                downloaded_at: new Date().toISOString(),
            })
            .eq("event_id", eventId)
            .eq("attendee_id", attendeeId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            msg: "Download recorded",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
