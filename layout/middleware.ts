// layout/middleware.ts
import layout from "@os/podium";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Podium 컨텍스트 생성
  const incoming = layout.middleware();

  try {
    // Express 스타일의 req, res, next를 시뮬레이션
    // Podium이 필요로 하는 req 객체 속성 더 정확하게 구현
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

    // 디버깅 로그
    console.log("[Middleware] Request object:", {
      protocol: req.protocol,
      hostname: req.hostname,
      url: req.url,
      method: req.method,
      secure: req.secure,
      path: req.path,
    });

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

    // 디버깅을 위한 로그 추가
    console.log(
      "[Middleware] Podium context:",
      JSON.stringify(podiumContext, null, 2)
    );
    console.log(
      "[Middleware] Podlet 개수:",
      podiumContext?.podlets ? Object.keys(podiumContext.podlets).length : 0
    );

    // 컨텍스트가 없거나 podlets이 비어있는 경우 로그 출력
    if (
      !podiumContext ||
      !podiumContext.podlets ||
      Object.keys(podiumContext.podlets).length === 0
    ) {
      console.warn(
        "[Middleware] ⚠️ Podium context is empty or missing podlets!"
      );
    }

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
    console.error(
      "[Middleware] Error details:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[Middleware] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // 오류가 발생해도 요청은 계속 처리
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/:path*",
};
