export async function GET() {
  return Response.redirect(new URL("/api/ics", "https://example.com"));
}
