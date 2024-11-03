// route.js
import { signup, signin } from "@/src/server/controllers/authController";
import { NextResponse } from "next/server";

export async function POST(request) {
  const url = new URL(request.url);
  const action =
    url.searchParams.get("controllerName") || (await request.json()).action;

  switch (action) {
    case "signup":
      return await signup(request);
    case "signin":
      return await signin(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
