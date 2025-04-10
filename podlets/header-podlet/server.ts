// header-podlet/server.ts
import Podlet from "@podium/podlet";
import express from "express";
import path from "path";

const app = express();
const port = 7100; // header podlet 포트

// Podlet 인스턴스 생성
const podlet = new Podlet({
  name: "header", // 이름은 Layout에서 등록한 것과 일치해야 함
  version: "1.0.0",
  pathname: "/",
  manifest: "/manifest.json",
  development: process.env.NODE_ENV !== "production",
});

app.use(podlet.middleware());

// 정적 파일 서빙 (CSS, JS)
app.use("/static", express.static(path.join(__dirname, "public")));

// CSS와 JS 리소스 등록 - 타입 이슈 해결을 위해 타입 캐스팅 사용
podlet.css({ value: "http://localhost:7100/static/header.css" } as any);
podlet.js({
  value: "http://localhost:7100/static/header.js",
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
    <header class="podlet-header">
      <div class="logo">MicroFrontend Demo</div>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      <div id="user-info">
        <span id="username">Guest</span>
        <button id="login-btn">Login</button>
      </div>
    </header>
  `);
});

// Manifest 라우트
app.get(podlet.manifest(), (req, res) => {
  res.status(200).send(podlet);
});

// Fallback 라우트
app.get(podlet.fallback(), (req, res) => {
  res.status(200).podiumSend(`
    <header class="podlet-header-fallback">
      <div class="logo">MicroFrontend Demo</div>
    </header>
  `);
});

// 서버 시작
app.listen(port, () => {
  console.log(`Header podlet server running at http://localhost:${port}`);
});
