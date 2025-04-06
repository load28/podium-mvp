// layout/middleware.ts
import layout from "@os/podium";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Podium 컨텍스트 생성
  const incoming = layout.middleware();

  try {
    // Express 스타일의 req, res, next를 시뮬레이션
    const url = new URL(request.url);

    const req: any = {
      protocol: request.nextUrl.protocol.replace(":", ""),
      hostname:
        request.headers.get("host")?.split(":")[0] || request.nextUrl.hostname,
      url: request.nextUrl.pathname + request.nextUrl.search,
      originalUrl: request.nextUrl.pathname + request.nextUrl.search,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      get: (name: string) => {
        if (name === "host" || name === "Host")
          return request.headers.get("host") || request.nextUrl.host;
        return request.headers.get(name);
      },
      connection: {
        encrypted: request.nextUrl.protocol === "https:",
      },
      // Podium에 필요한 추가 속성들
      secure: request.nextUrl.protocol === "https:",
      path: request.nextUrl.pathname,
    };

    // Express 응답 객체 시뮬레이션
    const res: any = {
      locals: {},
      getHeader: (name: string) => null,
      setHeader: (name: string, value: string) => {},
      once: (event: string, callback: Function) => {},
    };

    // Express next 함수 시뮬레이션
    const next = (err?: Error) => {
      if (err) console.error("[Podium Middleware] Error:", err);
    };

    // Express 컨텍스트를 사용하여 Podium 컨텍스트 생성
    await incoming(req, res, next);

    // Next.js 요청에 Podium 컨텍스트 추가
    const podiumContext = res.locals.podium;

    const requestHeaders = new Headers(request.headers);
    if (podiumContext) {
      requestHeaders.set("x-podium-context", JSON.stringify(podiumContext));
    }

    // 수정된 헤더로 요청 전달
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("[Middleware] Error generating Podium context:", error);

    // 오류가 발생해도 요청은 계속 처리
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/:path*",
};
