// route.js
import {
  createNew,
  getMyFlashCard,
  deleteFlashCardGroup
} from "@/src/server/controllers/flashCardController";
import { NextResponse } from "next/server";

export async function POST(request) {
  const url = new URL(request.url);
  const action =
    url.searchParams.get("controllerName") || (await request.json()).action;

  switch (action) {
    case "createNew":
      return await createNew(request);
    // case "signin":
    //   return await signin(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const action =
    url.searchParams.get("controllerName") || (await request.json()).action;

  switch (action) {
    case "getMyFlashCard":
      return await getMyFlashCard(request);
    // case "signin":
    //   return await signin(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const action =
    url.searchParams.get("controllerName") || (await request.json()).action;

  switch (action) {
    case "deleteFlashCardGroup":
      return await deleteFlashCardGroup(request);
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
