import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAIN_API_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";
const API_KEY = process.env.EVENTSNAP_API_KEY || "";
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "";
const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || "";

// POST /api/attendee/sort — Send stored encodings + eventCode to backend
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { attendeeId, eventCode } = body as {
            attendeeId?: string;
            eventCode?: string;
        };

        if (!attendeeId || !eventCode) {
            return NextResponse.json(
                { err: "Missing attendeeId or eventCode" },
                { status: 400 }
            );
        }

        // Validate event code format
        if (eventCode.length !== 6) {
            return NextResponse.json(
                { err: "Event code must be 6 characters" },
                { status: 400 }
            );
        }

        // Fetch stored encodings
        const { data: attendee } = await supabase
            .from("attendees")
            .select("face_encoding")
            .eq("id", attendeeId)
            .single();

        if (!attendee || !attendee.face_encoding) {
            return NextResponse.json(
                { err: "No face encoding found. Please complete face scan first." },
                { status: 400 }
            );
        }

        // Verify event exists and is active
        const { data: event } = await supabase
            .from("events")
            .select("id, code, status")
            .eq("code", eventCode.toUpperCase())
            .single();

        if (!event) {
            return NextResponse.json(
                { err: "Invalid event code" },
                { status: 404 }
            );
        }

        if (event.status !== "active") {
            return NextResponse.json(
                { err: "This event is no longer active" },
                { status: 400 }
            );
        }

        // Call main_api sort-attendee with stored encodings
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (API_KEY) {
            headers["X-API-Key"] = API_KEY;
        }

        const sortRes = await fetch(`${MAIN_API_URL}/api/sort-attendee/`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                minio_folder_path: eventCode.toUpperCase(),
                attendee_encodings: attendee.face_encoding,
            }),
        });

        if (!sortRes.ok) {
            const errData = await sortRes.json().catch(() => ({}));
            return NextResponse.json(
                { err: errData.detail || "Sort failed" },
                { status: sortRes.status }
            );
        }

        const data = await sortRes.json();

        // Transform MinIO paths to full URLs
        const photos = (data.photos || []).map((path: string) => ({
            url: `${MINIO_ENDPOINT}/${MINIO_BUCKET}/${path}`,
            filename: path.split("/").pop() || path,
            path,
        }));

        // Record event access in event_attendees
        const { data: existingAccess } = await supabase
            .from("event_attendees")
            .select("id")
            .eq("event_id", event.id)
            .eq("attendee_id", attendeeId)
            .single();

        if (!existingAccess) {
            await supabase.from("event_attendees").insert({
                event_id: event.id,
                attendee_id: attendeeId,
            });
        }

        return NextResponse.json({
            success: true,
            matchesFound: data.matches_found || 0,
            photos,
        });
    } catch (err: unknown) {
        console.error("Sort error:", err);
        const message = err instanceof Error ? err.message : "Sort failed";
        return NextResponse.json({ err: message }, { status: 500 });
    }
}
