import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import Attendee from "@/models/attendee.model";
import Event from "@/models/event.model";
import { attendeeRegisterSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/redis";

// POST — Register attendee and grant access to event
export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const { allowed } = await rateLimit(`ratelimit:attendee:${ip}`, 20, 60);
        if (!allowed) {
            return NextResponse.json(
                { err: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = attendeeRegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        await connect();

        // Verify event code exists
        const event = await Event.findOne({ code: validation.data.eventCode });
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
        let attendee = await Attendee.findOne({
            email: validation.data.email,
        });

        if (!attendee) {
            attendee = await Attendee.create({
                name: validation.data.name,
                email: validation.data.email,
                eventsAccessed: [],
            });
        }

        // Check if already accessed this event
        const alreadyAccessed = attendee.eventsAccessed.some(
            (a: any) => a.event.toString() === event._id.toString()
        );

        if (!alreadyAccessed) {
            attendee.eventsAccessed.push({
                event: event._id,
                accessedAt: new Date(),
                downloaded: false,
            });
            await attendee.save();

            // Add attendee to event's access list
            if (!event.attendeesAccessed.includes(attendee._id)) {
                event.attendeesAccessed.push(attendee._id);
                await event.save();
            }
        }

        return NextResponse.json({
            success: true,
            msg: "Access granted",
            attendeeId: attendee._id,
            eventName: event.name,
            eventCode: event.code,
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
