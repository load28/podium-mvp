// footer-podlet/server.ts
import Podlet from "@podium/podlet";
import express from "express";
import path from "path";

const app = express();
const port = 7300; // footer podlet 포트

// Podlet 인스턴스 생성
const podlet = new Podlet({
  name: "footer", // 이름은 Layout에서 등록한 것과 일치해야 함
  version: "1.0.0",
  pathname: "/",
  manifest: "/manifest.json",
  development: process.env.NODE_ENV !== "production",
});

app.use(podlet.middleware());

// 정적 파일 서빙 (CSS, JS)
app.use("/static", express.static(path.join(__dirname, "public")));

// CSS와 JS 리소스 등록 - 타입 이슈 해결을 위해 타입 캐스팅 사용
podlet.css({ value: "http://localhost:7300/static/footer.css" } as any);
podlet.js({
  value: "http://localhost:7300/static/footer.js",
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
    <footer class="podlet-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>About Us</h4>
          <p>MicroFrontend Demo showcasing Podium with Next.js</p>
        </div>
        <div class="footer-section">
          <h4>Links</h4>
          <ul>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/help">Help Center</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p>Email: info@example.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2025 MicroFrontend Demo. All rights reserved.</p>
      </div>
    </footer>
  `);
});

// Manifest 라우트
app.get(podlet.manifest(), (req, res) => {
  res.status(200).send(podlet);
});

// Fallback 라우트
app.get(podlet.fallback(), (req, res) => {
  res.status(200).podiumSend(`
    <footer class="podlet-footer-fallback">
      <p>&copy; 2025 MicroFrontend Demo</p>
    </footer>
  `);
});

// 서버 시작
app.listen(port, () => {
  console.log(`Footer podlet server running at http://localhost:${port}`);
});
