// app/api/podlet/[name]/route.ts
import layout from "@/lib/podium";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    name: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { name } = params;

  try {
    const podlet = layout.client.get(name);
    if (!podlet) {
      return NextResponse.json(
        { error: `Podlet "${name}" not found` },
        { status: 404 }
      );
    }

    const response = await fetch(podlet.content);
    const content = await response.text();

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error(`Error proxying podlet "${name}":`, error);
    return NextResponse.json(
      { error: "Failed to fetch podlet content" },
      { status: 500 }
    );
  }
}
