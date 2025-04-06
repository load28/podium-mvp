// app/components/PodletClient.tsx
"use client";

import { PodiumContext } from "@os/podium";
import { useEffect, useState } from "react";

interface PodletClientProps {
  name: string;
  context: PodiumContext;
}

export default function PodletClient({ name, context }: PodletClientProps) {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    async function fetchPodlet() {
      try {
        const podlet = context.podlets[name];
        if (!podlet) {
          console.error(`Podlet "${name}" not found`);
          return;
        }

        // Podlet의 콘텐츠 가져오기 (API 라우트 이용)
        const response = await fetch(`/api/podlet/${name}`);
        const html = await response.text();
        setContent(html);

        // CSS 및 JavaScript 자산 처리
        podlet.css.forEach((css) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = css;
          document.head.appendChild(link);
        });

        podlet.js.forEach((js) => {
          const script = document.createElement("script");
          script.src = js;
          script.defer = true;
          document.body.appendChild(script);
        });
      } catch (error) {
        console.error(`Error fetching podlet "${name}":`, error);
      }
    }

    if (context && context.podlets) {
      fetchPodlet();
    }
  }, [name, context]);

  return (
    <div id={`podlet-${name}`} dangerouslySetInnerHTML={{ __html: content }} />
  );
}
