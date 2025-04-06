// layout/app/lib/podium.ts
import Layout from "@podium/layout";

// Podium Layout 설정
const layout = new Layout({
  name: "myLayout",
  pathname: "/",
  logger: {
    level: "debug", // 디버그 로그 활성화
  },
});

// 실제 Podlet 서버 등록
layout.client.register({
  name: "header",
  uri: "http://localhost:7100/manifest.json",
});

layout.client.register({
  name: "content",
  uri: "http://localhost:7200/manifest.json",
});

layout.client.register({
  name: "footer",
  uri: "http://localhost:7300/manifest.json",
});

export default layout;

// Podium Context의 타입 정의
export interface PodletContent {
  css: string[];
  js: string[];
  content: string;
}

export interface PodiumPodlet {
  name: string;
  content: string;
  css: string[];
  js: string[];
  fallback: string;
}

export interface PodiumContext {
  podlets: {
    [key: string]: PodiumPodlet;
  };
  locale: string;
  debug: boolean;
  mountOrigin: string;
  publicPathname: string;
}
