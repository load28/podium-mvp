// layout/app/components/PodletServer.tsx
import { PodiumContext } from "@os/podium";

interface PodletServerProps {
  name: string;
  context: PodiumContext;
}

// 포트 번호 매핑 (컴포넌트 외부에 선언하여 재사용 가능)
const podletPorts = {
  header: 7100,
  content: 7200,
  footer: 7300,
};

// CSS/JS URL 객체 인터페이스 정의
interface AssetUrlObject {
  value: string;
  defer?: boolean;
  type?: string;
  rel?: string;
  [key: string]: any; // 다른 속성들
}

// URL이 상대 경로인 경우 절대 URL로 변환하는 유틸리티 함수
const ensureAbsoluteUrl = (url: unknown, podletName: string): string => {
  console.log("원본 url 입력값:", url);

  // url이 객체인 경우 value 속성 추출
  if (url !== null && typeof url === "object") {
    const urlObj = url as Record<string, any>;
    if ("value" in urlObj && typeof urlObj.value === "string") {
      console.log(`URL 객체 감지됨 (${podletName}): value 속성 사용`, urlObj);
      return ensureAbsoluteUrl(urlObj.value, podletName);
    }
  }

  // url이 문자열이 아니면 빈 문자열 반환
  if (url === null || url === undefined) return "";
  if (typeof url !== "string") {
    console.warn(`[PodletServer] URL is not a string for ${podletName}:`, url);
    return "";
  }

  // 빈 문자열인 경우 그대로 반환
  if (url.trim() === "") return url;

  try {
    // 이미 절대 URL 형태인지 확인
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // 이미 완전한 URL이면 그대로 반환
      return url;
    }

    // localhost:3000으로 시작하는 URL인 경우 podlet 서버 포트로 변환
    if (url.includes("localhost:3000")) {
      const port = podletPorts[podletName as keyof typeof podletPorts];
      if (!port) {
        console.warn(`Unknown podlet name for URL conversion: ${podletName}`);
        return url;
      }

      return url.replace("localhost:3000", `localhost:${port}`);
    }

    // 상대 경로인 경우, 포트 번호를 사용하여 절대 URL로 변환
    const port = podletPorts[podletName as keyof typeof podletPorts];
    if (!port) {
      console.warn(`Unknown podlet name for URL conversion: ${podletName}`);
      return url;
    }

    // 이미 절대 경로인지 확인
    if (url.startsWith("/")) {
      return `http://localhost:${port}${url}`;
    } else {
      // 상대 경로라면 슬래시 추가
      return `http://localhost:${port}/${url}`;
    }
  } catch (e) {
    console.error(`[PodletServer] URL 변환 중 오류: ${e}`, { url, podletName });
    return "";
  }
};

// HTML 내용에서 상대 경로를 절대 경로로 변환하는 함수
const rewriteHtmlPaths = (html: string, podletName: string): string => {
  if (!html) return html;

  const port = podletPorts[podletName as keyof typeof podletPorts];
  if (!port) return html;

  try {
    // CSS 링크 변환 (href="/static/..." 또는 href="static/..." 형태)
    let processedHtml = html.replace(
      /(href=["'])(\/?)([^"'http][^"']*["'])/gi,
      (match, prefix, slash, path) => {
        // 이미 http://로 시작하는 절대 URL은 변환하지 않음
        if (path.startsWith("http://") || path.startsWith("https://")) {
          return match;
        }

        // 따옴표 제거
        const cleanPath = path.replace(/["']/g, "");
        // 슬래시로 시작하는지 확인
        const fullPath = cleanPath.startsWith("/")
          ? cleanPath
          : `/${cleanPath}`;

        return `${prefix}http://localhost:${port}${fullPath}"`;
      }
    );

    // JavaScript src 변환 (src="/static/..." 또는 src="static/..." 형태)
    processedHtml = processedHtml.replace(
      /(src=["'])(\/?)([^"'http][^"']*["'])/gi,
      (match, prefix, slash, path) => {
        // 이미 http://로 시작하는 절대 URL은 변환하지 않음
        if (path.startsWith("http://") || path.startsWith("https://")) {
          return match;
        }

        // 따옴표 제거
        const cleanPath = path.replace(/["']/g, "");
        // 슬래시로 시작하는지 확인
        const fullPath = cleanPath.startsWith("/")
          ? cleanPath
          : `/${cleanPath}`;

        return `${prefix}http://localhost:${port}${fullPath}"`;
      }
    );

    return processedHtml;
  } catch (e) {
    console.error(`[PodletServer] HTML 경로 변환 중 오류:`, e);
    return html;
  }
};

// Server Component
export async function PodletServer({ name, context }: PodletServerProps) {
  try {
    const podlet = context.podlets[name];
    if (!podlet) {
      console.error(`Podlet "${name}" not found in context`);
      return (
        <div
          className="podlet-error"
          style={{
            padding: "1rem",
            margin: "1rem 0",
            backgroundColor: "#fff3f3",
            border: "1px solid #ffcdd2",
            borderRadius: "4px",
          }}
        >
          <h3>Podlet Not Found</h3>
          <p>
            The "{name}" podlet could not be found. Please check if the podlet
            server is running.
          </p>
        </div>
      );
    }

    try {
      // 로깅을 통해 podlet 객체 구조 확인
      console.log(`[PodletServer] ${name} podlet:`, {
        content: podlet.content,
        css: podlet.css,
        js: podlet.js,
      });

      // content URL을 절대 URL로 변환
      const contentUrl = ensureAbsoluteUrl(podlet.content, name);
      console.log(
        `[PodletServer] ${name} content URL: ${contentUrl} (원본: ${JSON.stringify(
          podlet.content
        )})`
      );

      // 서버에서 Podlet 콘텐츠 가져오기
      const response = await fetch(contentUrl, {
        headers: { Accept: "text/html" },
        next: { revalidate: 10 }, // 10초마다 재검증
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch podlet: ${response.status} ${response.statusText}`
        );
      }

      const rawHtml = await response.text();

      // HTML 내용의 상대 경로 URL을 절대 경로로 변환
      const html = rewriteHtmlPaths(rawHtml, name);

      // 변환 전/후 HTML 차이 로깅(디버그용)
      if (html !== rawHtml) {
        console.log(`[PodletServer] ${name} HTML 내부 경로 변환 수행됨`);
        // 너무 길 수 있어 간단히 일부만 로깅
        if (rawHtml.length < 500) {
          console.log(`원본 HTML: ${rawHtml}`);
          console.log(`변환된 HTML: ${html}`);
        }
      }

      // Fallback URL이 있는 경우 fallback 콘텐츠도 가져오기
      let fallbackHtml = "";
      if (podlet.fallback) {
        try {
          // fallback URL도 절대 URL로 변환
          const fallbackUrl = ensureAbsoluteUrl(podlet.fallback, name);
          const fallbackResponse = await fetch(fallbackUrl, {
            next: { revalidate: 3600 },
          });
          if (fallbackResponse.ok) {
            const rawFallbackHtml = await fallbackResponse.text();
            // Fallback HTML도 경로 변환
            fallbackHtml = rewriteHtmlPaths(rawFallbackHtml, name);
          }
        } catch (fallbackError) {
          console.warn(`Failed to fetch fallback for ${name}:`, fallbackError);
        }
      }

      // CSS와 JS URL 처리 - 원본 객체 보존
      const cssUrls: (string | AssetUrlObject)[] = [];
      if (Array.isArray(podlet.css)) {
        for (const cssItem of podlet.css) {
          if (cssItem === null || cssItem === undefined) continue;

          // 객체인 경우 복사 후 value 속성만 변환
          if (typeof cssItem === "object" && cssItem !== null) {
            const cssObj = cssItem as Record<string, any>;
            if ("value" in cssObj && typeof cssObj.value === "string") {
              const transformedUrl = ensureAbsoluteUrl(cssObj.value, name);
              console.log(
                `[${name}] CSS 변환: ${cssObj.value} -> ${transformedUrl}`
              );

              // 원본 객체의 속성을 복사한 새 객체 생성
              cssUrls.push({
                ...cssObj,
                value: transformedUrl,
              } as AssetUrlObject);
            }
          } else if (typeof cssItem === "string") {
            // 문자열인 경우 직접 변환
            const transformedUrl = ensureAbsoluteUrl(cssItem, name);
            console.log(`[${name}] CSS 변환: ${cssItem} -> ${transformedUrl}`);
            if (transformedUrl) {
              cssUrls.push(transformedUrl);
            }
          }
        }
      }

      const jsUrls: (string | AssetUrlObject)[] = [];
      if (Array.isArray(podlet.js)) {
        for (const jsItem of podlet.js) {
          if (jsItem === null || jsItem === undefined) continue;

          // 객체인 경우 복사 후 value 속성만 변환
          if (typeof jsItem === "object" && jsItem !== null) {
            const jsObj = jsItem as Record<string, any>;
            if ("value" in jsObj && typeof jsObj.value === "string") {
              const transformedUrl = ensureAbsoluteUrl(jsObj.value, name);
              console.log(
                `[${name}] JS 변환: ${jsObj.value} -> ${transformedUrl}`
              );

              // 원본 객체의 속성을 복사한 새 객체 생성
              jsUrls.push({
                ...jsObj,
                value: transformedUrl,
              } as AssetUrlObject);
            }
          } else if (typeof jsItem === "string") {
            // 문자열인 경우 직접 변환
            const transformedUrl = ensureAbsoluteUrl(jsItem, name);
            console.log(`[${name}] JS 변환: ${jsItem} -> ${transformedUrl}`);
            if (transformedUrl) {
              jsUrls.push(transformedUrl);
            }
          }
        }
      }

      // URL 변환 결과 로깅
      console.log(`[PodletServer] ${name} CSS URLs:`, {
        original: podlet.css,
        transformed: cssUrls,
      });
      console.log(`[PodletServer] ${name} JS URLs:`, {
        original: podlet.js,
        transformed: jsUrls,
      });

      return (
        <div className={`podlet podlet-${name}`}>
          {/* CSS 리소스 */}
          {cssUrls.map((cssItem, i) => {
            // 객체인 경우
            if (typeof cssItem === "object" && cssItem !== null) {
              const item = cssItem as AssetUrlObject;
              return (
                <link
                  key={`${name}-css-${i}`}
                  rel={item.rel || "stylesheet"}
                  type={item.type || "text/css"}
                  href={item.value}
                />
              );
            }
            // 문자열인 경우
            return (
              <link
                key={`${name}-css-${i}`}
                rel="stylesheet"
                href={cssItem as string}
              />
            );
          })}

          {/* Podlet 콘텐츠 */}
          <div
            id={`podlet-${name}-content`}
            data-podlet-name={name}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* 숨겨진 Fallback 콘텐츠 (필요시 JS로 표시) */}
          {fallbackHtml && (
            <div
              id={`podlet-${name}-fallback`}
              style={{ display: "none" }}
              dangerouslySetInnerHTML={{ __html: fallbackHtml }}
            />
          )}

          {/* JavaScript 리소스 */}
          {jsUrls.map((jsItem, i) => {
            // 객체인 경우
            if (typeof jsItem === "object" && jsItem !== null) {
              const item = jsItem as AssetUrlObject;
              return (
                <script
                  key={`${name}-js-${i}`}
                  src={item.value}
                  defer={item.defer !== false}
                  type={item.type || undefined}
                />
              );
            }
            // 문자열인 경우
            return (
              <script key={`${name}-js-${i}`} src={jsItem as string} defer />
            );
          })}
        </div>
      );
    } catch (fetchError: any) {
      // any 타입으로 처리
      console.error(`Error fetching podlet "${name}":`, fetchError);

      // Fallback 콘텐츠 가져오기 시도
      if (podlet.fallback) {
        try {
          // fallback URL 절대 URL로 변환
          const fallbackUrl = ensureAbsoluteUrl(podlet.fallback, name);
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const rawFallbackHtml = await fallbackResponse.text();
            // Fallback HTML도 경로 변환
            const fallbackHtml = rewriteHtmlPaths(rawFallbackHtml, name);

            return (
              <div className={`podlet podlet-${name} podlet-fallback`}>
                <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
              </div>
            );
          }
        } catch (fallbackError) {
          console.error(`Failed to fetch fallback for ${name}:`, fallbackError);
        }
      }

      // 오류 표시
      return (
        <div
          className="podlet-error"
          style={{
            padding: "1rem",
            margin: "1rem 0",
            backgroundColor: "#fff3f3",
            border: "1px solid #ffcdd2",
            borderRadius: "4px",
          }}
        >
          <h3>Error Loading {name} Podlet</h3>
          <p>
            Failed to fetch content from the podlet server. Please try again
            later.
          </p>
          <details>
            <summary>Technical Details</summary>
            <pre>{fetchError.message}</pre>
          </details>
        </div>
      );
    }
  } catch (error) {
    console.error(`Unexpected error in PodletServer(${name}):`, error);
    return (
      <div
        className="podlet-error"
        style={{
          padding: "1rem",
          margin: "1rem 0",
          backgroundColor: "#fff3f3",
          border: "1px solid #ffcdd2",
          borderRadius: "4px",
        }}
      >
        <h3>Unexpected Error</h3>
        <p>Something went wrong while rendering the {name} podlet.</p>
      </div>
    );
  }
}
