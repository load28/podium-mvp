// layout/app/page.tsx
import { PodiumContext } from "@os/podium";
import { headers } from "next/headers";
import { PodletServer } from "./components/PodletServer";

export default async function Home() {
  // 서버 컴포넌트에서 Podium 컨텍스트 가져오기
  try {
    // 타입 문제를 해결하기 위해 as any 사용
    const headersList = headers() as any;
    const podiumContextStr = headersList?.get?.("x-podium-context") || null;

    console.log("[Page] Raw podium context from headers:", podiumContextStr);

    let podiumContext: PodiumContext = {
      podlets: {},
      locale: "en-US",
      debug: false,
      mountOrigin: "",
      publicPathname: "",
    };

    if (podiumContextStr) {
      try {
        podiumContext = JSON.parse(podiumContextStr);
        console.log(
          "[Page] Parsed podium context:",
          JSON.stringify(podiumContext, null, 2)
        );
      } catch (error) {
        console.error("Error parsing podium context:", error);
      }
    } else {
      console.log(
        "[Page] No podium context in headers! 직접 생성을 시도합니다..."
      );

      // 헤더에 컨텍스트가 없는 경우 수동으로 생성
      try {
        // 직접 각 podlet manifest를 가져와서 컨텍스트를 생성
        const podlets = ["header", "content", "footer"];
        const ports = { header: 7100, content: 7200, footer: 7300 };

        for (const podletName of podlets) {
          try {
            const port = ports[podletName as keyof typeof ports];
            const manifestUrl = `http://localhost:${port}/manifest.json`;

            console.log(`[Page] 수동 manifest 가져오기: ${manifestUrl}`);
            const manifestResponse = await fetch(manifestUrl, {
              cache: "no-store",
            });

            if (manifestResponse.ok) {
              const manifest = await manifestResponse.json();
              console.log(`[Page] ${podletName} manifest:`, manifest);

              podiumContext.podlets[podletName] = {
                name: manifest.name,
                content: manifest.content,
                fallback: manifest.fallback || "",
                css: manifest.css || [],
                js: manifest.js || [],
              };
            } else {
              console.error(
                `[Page] Manifest 가져오기 실패 ${podletName}:`,
                manifestResponse.status
              );
            }
          } catch (err) {
            console.error(
              `[Page] Podlet ${podletName} 매니페스트 가져오기 오류:`,
              err
            );
          }
        }
      } catch (error) {
        console.error("[Page] 수동 컨텍스트 생성 중 오류:", error);
      }
    }

    // 디버깅용 로그
    console.log(
      "Podium context loaded:",
      Object.keys(podiumContext.podlets).length,
      "podlets found"
    );

    return (
      <div className="microfrontend-app">
        {/* 헤더 Podlet */}
        <PodletServer name="header" context={podiumContext} />

        {/* 컨텐츠 Podlet */}
        <PodletServer name="content" context={podiumContext} />

        {/* 풋터 Podlet */}
        <PodletServer name="footer" context={podiumContext} />
      </div>
    );
  } catch (error) {
    console.error("[Page] 전체 페이지 로딩 중 오류:", error);
    return <div>페이지 로딩 중 오류가 발생했습니다.</div>;
  }
}
