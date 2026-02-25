import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAIN_API_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";
const API_KEY = process.env.EVENTSNAP_API_KEY || "";

// POST /api/attendee/encode — Send 3 face images to backend, store encodings
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { attendeeId, images } = body as {
            attendeeId?: string;
            images?: string[]; // 3 base64 face images
        };

        if (!attendeeId || !images || images.length !== 3) {
            return NextResponse.json(
                { err: "Must provide attendeeId and exactly 3 face images" },
                { status: 400 }
            );
        }

        // Verify attendee exists
        const { data: attendee } = await supabase
            .from("attendees")
            .select("id, face_encoding")
            .eq("id", attendeeId)
            .single();

        if (!attendee) {
            return NextResponse.json({ err: "Attendee not found" }, { status: 404 });
        }

        // Call backend encode-attendee endpoint
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (API_KEY) {
            headers["X-API-Key"] = API_KEY;
        }

        const encodeRes = await fetch(`${MAIN_API_URL}/api/encode-attendee/`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                attendee_images_base64: images,
            }),
        });

        if (!encodeRes.ok) {
            const errData = await encodeRes.json().catch(() => ({}));
            return NextResponse.json(
                { err: errData.detail || "Face encoding failed" },
                { status: encodeRes.status }
            );
        }

        const encodeData = await encodeRes.json();
        const encodings = encodeData.encodings as number[][];

        if (!encodings || encodings.length === 0) {
            return NextResponse.json(
                { err: "No face encodings could be generated" },
                { status: 400 }
            );
        }

        // Store encodings in Supabase
        const { error: updateError } = await supabase
            .from("attendees")
            .update({ face_encoding: encodings })
            .eq("id", attendeeId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            encodingCount: encodings.length,
            message: `Generated ${encodings.length} face encodings from 3 reference images`,
        });
    } catch (err: unknown) {
        console.error("Encode error:", err);
        const message = err instanceof Error ? err.message : "Encoding failed";
        return NextResponse.json({ err: message }, { status: 500 });
    }
}
