// footer-podlet/public/footer.js
document.addEventListener("DOMContentLoaded", () => {
  const copyright = document.querySelector(".copyright p");

  // 현재 연도 업데이트
  const currentYear = new Date().getFullYear();
  copyright.textContent = copyright.textContent.replace("2025", currentYear);

  // 사용자 로그인/로그아웃 이벤트 처리
  window.addEventListener("user-login", (event) => {
    // 로그인 사용자를 위한 추가 정보 표시
    const contactSection = document.querySelector(
      ".footer-section:nth-child(3)"
    );
    const userInfoElem = document.createElement("p");
    userInfoElem.id = "footer-user-info";
    userInfoElem.textContent = `Logged in as: ${event.detail.username}`;
    contactSection.appendChild(userInfoElem);
  });

  window.addEventListener("user-logout", () => {
    // 로그아웃 시 추가 정보 제거
    const userInfoElem = document.getElementById("footer-user-info");
    if (userInfoElem) {
      userInfoElem.remove();
    }
  });

  // 콘텐츠 로드 이벤트 처리
  window.addEventListener("content-loaded", () => {
    // 콘텐츠가 로드되면 피드백 표시
    const footerContent = document.querySelector(".footer-content");
    const feedbackElem = document.createElement("div");
    feedbackElem.className = "footer-section feedback";
    feedbackElem.innerHTML = `
        <h4>Feedback</h4>
        <p>How was your experience?</p>
        <div class="rating">
          <button class="rating-btn" data-rating="1">1</button>
          <button class="rating-btn" data-rating="2">2</button>
          <button class="rating-btn" data-rating="3">3</button>
          <button class="rating-btn" data-rating="4">4</button>
          <button class="rating-btn" data-rating="5">5</button>
        </div>
      `;
    footerContent.appendChild(feedbackElem);

    // 평점 버튼 이벤트 추가
    const ratingBtns = document.querySelectorAll(".rating-btn");
    ratingBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rating = btn.getAttribute("data-rating");
        alert(`Thank you for rating us ${rating}/5!`);
        feedbackElem.innerHTML = `<h4>Feedback</h4><p>Thank you for your feedback!</p>`;
      });
    });
  });

  // 이미 로그인한 경우 정보 표시
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    const username = localStorage.getItem("username") || "User";
    const contactSection = document.querySelector(
      ".footer-section:nth-child(3)"
    );
    const userInfoElem = document.createElement("p");
    userInfoElem.id = "footer-user-info";
    userInfoElem.textContent = `Logged in as: ${username}`;
    contactSection.appendChild(userInfoElem);
  }
});
