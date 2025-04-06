// layout/app/components/PodletCommunication.tsx
"use client";

import { useEffect } from "react";

// 마이크로프론트엔드 간 통신을 위한 클라이언트 컴포넌트
export default function PodletCommunication() {
  useEffect(() => {
    // Podlet 간 통신을 위한 이벤트 버스 설정
    const podiumMessageBus = {
      publish: (eventName: string, data?: any) => {
        const event = new CustomEvent(`podium:${eventName}`, {
          detail: data,
          bubbles: true,
        });
        window.dispatchEvent(event);
        console.log(`[MessageBus] Published: ${eventName}`, data);
      },

      subscribe: (eventName: string, callback: (data: any) => void) => {
        const handler = (event: CustomEvent) => callback(event.detail);
        window.addEventListener(
          `podium:${eventName}`,
          handler as EventListener
        );

        // 구독 취소 함수 반환
        return () => {
          window.removeEventListener(
            `podium:${eventName}`,
            handler as EventListener
          );
        };
      },
    };

    // 전역 객체에 메시지 버스 추가
    (window as any).podiumMessageBus = podiumMessageBus;

    // Podlet이 모두 로드되면 이벤트 발생
    const checkAllPodletsLoaded = () => {
      const podletContainers = document.querySelectorAll("[data-podlet-name]");
      console.log(`[Layout] Found ${podletContainers.length} podlets`);

      if (podletContainers.length >= 3) {
        console.log("[Layout] All podlets loaded, publishing ready event");
        podiumMessageBus.publish("layout:ready");
      }
    };

    // DOM 변화 감시
    const observer = new MutationObserver(checkAllPodletsLoaded);
    observer.observe(document.body, { childList: true, subtree: true });

    // 초기 검사
    checkAllPodletsLoaded();

    // Podlet 오류 관리 및 Fallback 처리
    window.addEventListener(
      "error",
      (event) => {
        if (
          event.target &&
          (event.target as HTMLElement).tagName === "SCRIPT"
        ) {
          const scriptSrc = (event.target as HTMLScriptElement).src;
          console.error(`[Layout] Script error: ${scriptSrc}`);

          // Podlet 스크립트에서 오류가 발생하면 fallback 콘텐츠 표시
          document.querySelectorAll('[id$="-fallback"]').forEach((fallback) => {
            const podletId = fallback.id.replace("-fallback", "-content");
            const content = document.getElementById(podletId);

            if (content) {
              content.style.display = "none";
              (fallback as HTMLElement).style.display = "block";
            }
          });
        }
      },
      true
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
