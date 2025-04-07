// content-podlet/server.ts
import Podlet from "@podium/podlet";
import express from "express";
import path from "path";

const app = express();
const port = 7200; // content podlet 포트

// Podlet 인스턴스 생성
const podlet = new Podlet({
  name: "content", // 이름은 Layout에서 등록한 것과 일치해야 함
  version: "1.0.0",
  pathname: "/",
  manifest: "/manifest.json",
  development: process.env.NODE_ENV !== "production",
});

app.use(podlet.middleware());

// 정적 파일 서빙 (CSS, JS)
app.use("/static", express.static(path.join(__dirname, "public")));

// CSS와 JS 리소스 등록 - 타입 이슈 해결을 위해 타입 캐스팅 사용
podlet.css({ value: "http://localhost:7200/static/content.css" } as any);
podlet.js({
  value: "http://localhost:7200/static/content.js",
  defer: true,
} as any);

podlet.view((incoming, fragment) => {
  // Podlet에서 제공하는 CSS와 JS 리소스 참조 유지
  const { css, js } = incoming;

  // CSS와 JS 태그 생성
  const cssLinks = css
    .map((item) => `<link rel="stylesheet" href="${item.value}">`)
    .join("\n");
  const jsScripts = js
    .map((item) => `<script src="${item.value}"></script>`)
    .join("\n");

  return `
    ${cssLinks}
    <div>${fragment}</div>
    ${jsScripts}
  `;
});

// 메인 콘텐츠 라우트
app.get(podlet.content(), (req, res) => {
  res.status(200).podiumSend(`
    <main class="podlet-content">
      <h1>Welcome to MicroFrontend Demo</h1>
      <p>This is a demonstration of Podium micro frontends with Next.js and Express.</p>
      <div class="features">
        <div class="feature-card">
          <h3>Micro Frontends</h3>
          <p>Independent teams can work on isolated parts of the UI.</p>
        </div>
        <div class="feature-card">
          <h3>Server-Side Composition</h3>
          <p>Assemble your UI on the server for better performance.</p>
        </div>
        <div class="feature-card">
          <h3>Technology Agnostic</h3>
          <p>Each micro frontend can use different frameworks and libraries.</p>
        </div>
      </div>
      <button id="load-more-btn">Load More Content</button>
    </main>
  `);
});

// Manifest 라우트
app.get(podlet.manifest(), (req, res) => {
  res.status(200).send(podlet);
});

// Fallback 라우트
app.get(podlet.fallback(), (req, res) => {
  res.status(200).podiumSend(`
    <main class="podlet-content-fallback">
      <h1>Welcome to MicroFrontend Demo</h1>
      <p>Loading content...</p>
    </main>
  `);
});

// 서버 시작
app.listen(port, () => {
  console.log(`Content podlet server running at http://localhost:${port}`);
});
