import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { s3, BUCKET } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import * as JSZip from "jszip";

const MAIN_API_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";
const API_KEY = process.env.EVENTSNAP_API_KEY || "";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]);

function isImageFile(filename: string): boolean {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
    return IMAGE_EXTENSIONS.has(ext) && !filename.startsWith("__MACOSX");
}

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse form data
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const eventId = formData.get("eventId") as string | null;

        if (!file || !eventId) {
            return NextResponse.json({ err: "Missing file or eventId" }, { status: 400 });
        }

        if (!file.name.endsWith(".zip")) {
            return NextResponse.json({ err: "File must be a ZIP archive" }, { status: 400 });
        }

        // 3. Verify event ownership
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        const { data: event } = await supabase
            .from("events")
            .select("id, code")
            .eq("id", eventId)
            .eq("owner_id", user.id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found or unauthorized" }, { status: 404 });
        }

        const folderName = event.code; // 6-char event code = MinIO folder

        // 4. Extract ZIP and upload images to MinIO
        const zipBuffer = Buffer.from(await file.arrayBuffer());
        const zip = await JSZip.loadAsync(zipBuffer);

        const uploadPromises: Promise<string>[] = [];

        zip.forEach((relativePath, entry) => {
            if (entry.dir) return;
            if (!isImageFile(relativePath)) return;

            // Get just the filename (strip nested directories from ZIP)
            const basename = relativePath.split("/").pop() || relativePath;

            const promise = entry.async("nodebuffer").then(async (data) => {
                const key = `${folderName}/${basename}`;
                await s3.send(
                    new PutObjectCommand({
                        Bucket: BUCKET,
                        Key: key,
                        Body: data,
                        ContentType: getContentType(basename),
                    })
                );
                return key;
            });

            uploadPromises.push(promise);
        });

        const uploadedKeys = await Promise.all(uploadPromises);

        if (uploadedKeys.length === 0) {
            return NextResponse.json({ err: "No images found in the ZIP file" }, { status: 400 });
        }

        // 5. Trigger encoding via main_api
        let taskId: string | null = null;
        try {
            const encHeaders: Record<string, string> = { "Content-Type": "application/json" };
            if (API_KEY) encHeaders["X-API-Key"] = API_KEY;

            const encodeRes = await fetch(`${MAIN_API_URL}/api/encode-event/`, {
                method: "POST",
                headers: encHeaders,
                body: JSON.stringify({ minio_folder_path: folderName }),
            });

            if (encodeRes.ok) {
                const encodeData = await encodeRes.json();
                taskId = encodeData.task_id || null;
            }
        } catch {
            // Encoding trigger failed but upload succeeded — non-fatal
            console.error("Failed to trigger encoding, but images uploaded successfully");
        }

        return NextResponse.json({
            success: true,
            imageCount: uploadedKeys.length,
            folder: folderName,
            taskId,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ err: "Upload failed" }, { status: 500 });
    }
}

function getContentType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();
    const types: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        bmp: "image/bmp",
        tiff: "image/tiff",
    };
    return types[ext || ""] || "application/octet-stream";
}

// Allow large file uploads (default is 1MB in Next.js)
export const config = {
    api: {
        bodyParser: false,
    },
};
