import { NextRequest, NextResponse } from "next/server";
import { verifyUploadToken } from "@/server/uploadAuth";
import { ObjectStorageService } from "@/server/objectStorage";

const storage = new ObjectStorageService();

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-upload-token") ?? "";
    const slug = verifyUploadToken(token);
    if (!slug) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

    const body = await request.json() as { name?: unknown; size?: unknown; contentType?: unknown };
    const { name, size, contentType } = body;

    if (!name || typeof name !== "string" || name.trim() === "") return NextResponse.json({ error: "name fehlt" }, { status: 400 });
    if (!size || typeof size !== "number" || size < 1) return NextResponse.json({ error: "size fehlt" }, { status: 400 });
    if (!contentType || typeof contentType !== "string" || contentType.trim() === "") return NextResponse.json({ error: "contentType fehlt" }, { status: 400 });

    const uploadURL = await storage.getObjectEntityUploadURL();
    const objectPath = new URL(uploadURL).pathname;
    return NextResponse.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload-URL konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
