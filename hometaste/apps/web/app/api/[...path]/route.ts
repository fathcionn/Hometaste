import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.BACKEND_URL ?? "http://localhost:4173";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}

async function proxy(request: NextRequest, path: string[]) {
  const init: RequestInit = {
    method: request.method,
    headers: request.headers
  };
  if (request.method !== "GET") init.body = await request.text();
  const response = await fetch(`${API_URL}/api/${path.join("/")}${request.nextUrl.search}`, init);
  return new NextResponse(response.body, { status: response.status, headers: response.headers });
}
