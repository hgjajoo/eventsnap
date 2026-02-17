import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connect } from "@/db/dbConfig";
import Event from "@/models/event.model";
import User from "@/models/user.model";
import { updateEventSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET — Single event details
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        await connect();
        const event = await Event.findById(id).populate(
            "attendeesAccessed",
            "name email eventsAccessed"
        );

        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user || event.owner.toString() !== user._id.toString()) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        return NextResponse.json({ event, success: true });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// PUT — Update event
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = updateEventSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        await connect();
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user || event.owner.toString() !== user._id.toString()) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        const updated = await Event.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true }
        );

        return NextResponse.json({
            event: updated,
            success: true,
            msg: "Event updated successfully",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// DELETE — Delete event
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        await connect();
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user || event.owner.toString() !== user._id.toString()) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        user.events = user.events.filter(
            (eventId: any) => eventId.toString() !== id
        );
        await user.save();

        await Event.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            msg: "Event deleted successfully",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
