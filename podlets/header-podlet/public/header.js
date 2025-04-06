// header-podlet/public/header.js
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const username = document.getElementById("username");

  // 로그인 상태 확인 (실제로는 세션/쿠키 등을 통해 확인)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    username.textContent = localStorage.getItem("username") || "User";
    loginBtn.textContent = "Logout";
  } else {
    username.textContent = "Guest";
    loginBtn.textContent = "Login";
  }

  // 로그인/로그아웃 버튼 이벤트
  loginBtn.addEventListener("click", () => {
    if (isLoggedIn) {
      // 로그아웃 처리
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      username.textContent = "Guest";
      loginBtn.textContent = "Login";

      // 이벤트 디스패치 (다른 Podlet에 알림)
      window.dispatchEvent(new CustomEvent("user-logout"));
    } else {
      // 로그인 모달 표시 (간단한 예시)
      const user = prompt("Enter your username:");
      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", user);
        username.textContent = user;
        loginBtn.textContent = "Logout";

        // 이벤트 디스패치 (다른 Podlet에 알림)
        window.dispatchEvent(
          new CustomEvent("user-login", {
            detail: { username: user },
          })
        );
      }
    }
  });

  // 글로벌 이벤트 리스닝 (다른 Podlet에서 발생한 이벤트 처리)
  window.addEventListener("user-login", (event) => {
    username.textContent = event.detail.username;
    loginBtn.textContent = "Logout";
  });

  window.addEventListener("user-logout", () => {
    username.textContent = "Guest";
    loginBtn.textContent = "Login";
  });
});
