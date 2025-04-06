// content-podlet/public/content.js
document.addEventListener("DOMContentLoaded", () => {
  const loadMoreBtn = document.getElementById("load-more-btn");
  const featuresContainer = document.querySelector(".features");

  // 추가 콘텐츠 데이터
  const additionalFeatures = [
    {
      title: "Scalable Architecture",
      description: "Scale your frontend as your application and team grows.",
    },
    {
      title: "Independent Deployment",
      description:
        "Deploy parts of your application without rebuilding everything.",
    },
    {
      title: "Resilience",
      description:
        "Isolate failures to specific components of your application.",
    },
  ];

  // 사용자 로그인/로그아웃 이벤트 처리
  window.addEventListener("user-login", (event) => {
    // 로그인 후 개인화된 콘텐츠 표시
    const mainHeading = document.querySelector(".podlet-content h1");
    mainHeading.textContent = `Welcome, ${event.detail.username}!`;
  });

  window.addEventListener("user-logout", () => {
    // 로그아웃 후 기본 콘텐츠로 복원
    const mainHeading = document.querySelector(".podlet-content h1");
    mainHeading.textContent = "Welcome to MicroFrontend Demo";
  });

  // 추가 콘텐츠 로드 버튼 이벤트
  loadMoreBtn.addEventListener("click", () => {
    // 버튼 비활성화 (중복 클릭 방지)
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "Loading...";

    // 실제 애플리케이션에서는 비동기 API 호출로 대체
    setTimeout(() => {
      // 추가 피처 카드 생성
      additionalFeatures.forEach((feature) => {
        const featureCard = document.createElement("div");
        featureCard.className = "feature-card";
        featureCard.innerHTML = `
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
          `;

        // 애니메이션 효과
        featureCard.style.opacity = "0";
        featuresContainer.appendChild(featureCard);

        setTimeout(() => {
          featureCard.style.transition = "opacity 0.5s";
          featureCard.style.opacity = "1";
        }, 10);
      });

      // 버튼 상태 업데이트
      loadMoreBtn.textContent = "All Content Loaded";

      // 이벤트 발생 (콘텐츠 로드 완료)
      window.dispatchEvent(new CustomEvent("content-loaded"));
    }, 1000);
  });

  // 로그인 상태 확인 및 콘텐츠 개인화
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    const username = localStorage.getItem("username") || "User";
    const mainHeading = document.querySelector(".podlet-content h1");
    mainHeading.textContent = `Welcome, ${username}!`;
  }
});
