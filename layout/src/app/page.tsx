// layout/app/page.tsx
import { PodiumContext } from "@os/podium";
import { headers } from "next/headers";
import { PodletServer } from "./components/PodletServer";

export default async function Home() {
  // 서버 컴포넌트에서 Podium 컨텍스트 가져오기
  try {
    // 타입 문제를 해결하기 위해 as any 사용
    const headersList = (await headers()) as any;
    const podiumContextStr = headersList?.get?.("x-podium-context") || null;

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
      } catch (error) {
        console.error("Error parsing podium context:", error);
      }
    } else {
      // 헤더에 컨텍스트가 없는 경우 수동으로 생성
      try {
        // 직접 각 podlet manifest를 가져와서 컨텍스트를 생성
        const podlets = ["header", "content", "footer"];
        const ports = { header: 7100, content: 7200, footer: 7300 };

        for (const podletName of podlets) {
          try {
            const port = ports[podletName as keyof typeof ports];
            const manifestUrl = `http://localhost:${port}/manifest.json`;

            const manifestResponse = await fetch(manifestUrl, {
              cache: "no-store",
            });

            if (manifestResponse.ok) {
              const manifest = await manifestResponse.json();

              podiumContext.podlets[podletName] = {
                name: manifest.name,
                content: manifest.content,
                fallback: manifest.fallback || "",
                css: manifest.css || [],
                js: manifest.js || [],
              };
            }
          } catch (err) {
            console.error(
              `Podlet ${podletName} 매니페스트 가져오기 오류:`,
              err
            );
          }
        }
      } catch (error) {
        console.error("수동 컨텍스트 생성 중 오류:", error);
      }
    }

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
    console.error("페이지 로딩 중 오류:", error);
    return <div>페이지 로딩 중 오류가 발생했습니다.</div>;
  }
}
