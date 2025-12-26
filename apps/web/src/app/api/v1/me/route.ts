import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth.server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { userId, teamId, role } = await verifyAuth(authHeader);

    return NextResponse.json({
      user_id: userId,
      team_id: teamId,
      role: role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json(
      { error: message },
      { status: 401 },
    );
  }
}
