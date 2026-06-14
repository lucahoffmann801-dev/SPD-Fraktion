import { NextRequest, NextResponse } from "next/server";
import { ObjectStorageService, ObjectNotFoundError } from "@/server/objectStorage";

const storage = new ObjectStorageService();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const objectPath = "/objects/" + path.join("/");
    const file = await storage.getObjectEntityFile(objectPath);
    return storage.downloadObject(file);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) return NextResponse.json({ error: "Object not found." }, { status: 404 });
    const message = error instanceof Error ? error.message : "Failed to serve object.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
