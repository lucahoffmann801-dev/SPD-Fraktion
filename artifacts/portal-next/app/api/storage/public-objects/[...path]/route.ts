import { NextRequest, NextResponse } from "next/server";
import { ObjectStorageService } from "@/server/objectStorage";

const storage = new ObjectStorageService();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const filePath = path.join("/");
    const file = await storage.searchPublicObject(filePath);
    if (!file) return NextResponse.json({ error: "File not found." }, { status: 404 });
    return storage.downloadObject(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to serve public object.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
