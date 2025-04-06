// app/lib/podium-utils.ts
import { PodiumContext, PodiumPodlet } from "./podium";

/**
 * Podium 컨텍스트에서 특정 Podlet 가져오기
 */
export function getPodlet(
  context: PodiumContext,
  name: string
): PodiumPodlet | null {
  if (!context || !context.podlets || !context.podlets[name]) {
    return null;
  }
  return context.podlets[name];
}

/**
 * Podlet의 CSS와 JavaScript 리소스를 DOM에 추가
 */
export function injectPodletResources(podlet: PodiumPodlet): void {
  if (!podlet) return;

  // CSS 리소스 추가
  podlet.css.forEach((css) => {
    // 이미 존재하는지 확인
    const existingLink = document.querySelector(`link[href="${css}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = css;
    document.head.appendChild(link);
  });

  // JavaScript 리소스 추가
  podlet.js.forEach((js) => {
    // 이미 존재하는지 확인
    const existingScript = document.querySelector(`script[src="${js}"]`);
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = js;
    script.defer = true;
    document.body.appendChild(script);
  });
}

/**
 * Podium 컨텍스트 파싱 헬퍼
 */
export function parsePodiumContext(
  contextStr: string | null
): PodiumContext | null {
  if (!contextStr) return null;

  try {
    return JSON.parse(contextStr);
  } catch (error) {
    console.error("Error parsing podium context:", error);
    return null;
  }
}
