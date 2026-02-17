import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import Attendee from "@/models/attendee.model";

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

        await connect();

        const attendee = await Attendee.findById(attendeeId);
        if (!attendee) {
            return NextResponse.json(
                { err: "Attendee not found" },
                { status: 404 }
            );
        }

        // Update the download status for this event
        const eventAccess = attendee.eventsAccessed.find(
            (a: any) => a.event.toString() === eventId
        );

        if (eventAccess) {
            eventAccess.downloaded = true;
            eventAccess.downloadedAt = new Date();
            await attendee.save();
        }

        return NextResponse.json({
            success: true,
            msg: "Download recorded",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
