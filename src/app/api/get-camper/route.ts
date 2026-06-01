import { NextRequest, NextResponse } from "next/server";
import data from "./data.json";

export interface Camper {
  name: string;
  camper_id: string;
  dream: string;
  comments: string[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id?.trim()) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const normalizedId = id.trim().toLowerCase();
  const camper = (data as Camper[]).find(
    (entry) => entry.camper_id.trim().toLowerCase() === normalizedId
  );

  if (!camper) {
    return NextResponse.json({ error: "Camper not found" }, { status: 404 });
  }

  return NextResponse.json(camper);
}
