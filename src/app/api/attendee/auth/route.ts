import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
import { attendeeAuthSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// POST /api/attendee/auth — Seamless login/register
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = attendeeAuthSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password, name } = validation.data;

        // Check if attendee exists
        const { data: existing } = await supabase
            .from("attendees")
            .select("id, password_hash, face_encoding")
            .eq("email", email)
            .single();

        if (existing) {
            // Login — verify password
            if (!existing.password_hash) {
                // Legacy attendee without password — set it now
                const hash = await bcrypt.hash(password, SALT_ROUNDS);
                await supabase
                    .from("attendees")
                    .update({ password_hash: hash })
                    .eq("id", existing.id);

                return NextResponse.json({
                    success: true,
                    attendeeId: existing.id,
                    hasEncoding: !!existing.face_encoding,
                    isNew: false,
                });
            }

            const valid = await bcrypt.compare(password, existing.password_hash);
            if (!valid) {
                return NextResponse.json(
                    { err: "Incorrect password" },
                    { status: 401 }
                );
            }

            return NextResponse.json({
                success: true,
                attendeeId: existing.id,
                hasEncoding: !!existing.face_encoding,
                isNew: false,
            });
        }

        // Register — create new attendee
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const { data: created, error } = await supabase
            .from("attendees")
            .insert({
                name: name || "Attendee",
                email,
                password_hash: hash,
            })
            .select("id")
            .single();

        if (error) {
            if (error.code === "23505") {
                // Unique constraint violation (race condition)
                return NextResponse.json(
                    { err: "An account with this email already exists" },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            attendeeId: created!.id,
            hasEncoding: false,
            isNew: true,
        });
    } catch (err: unknown) {
        console.error("Auth error:", err);
        const message = err instanceof Error ? err.message : "Authentication failed";
        return NextResponse.json({ err: message }, { status: 500 });
    }
}
