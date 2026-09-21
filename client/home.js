const token = localStorage.getItem("token");

const navButtons = document.getElementById("navButtons");

if (token) {
    navButtons.innerHTML = `
        <a href="index.html" class="login-btn">Dashboard</a>
        <button id="homeLogoutBtn" class="register-btn">Logout</button>
    `;
}
const homeLogoutBtn = document.getElementById("homeLogoutBtn");

if (homeLogoutBtn) {
    homeLogoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "home.html";
    });
}