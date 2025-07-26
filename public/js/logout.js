// public/js/logout.js

// 🔘 Logout button handler
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut()
      .then(() => {
        // ✅ Alert once and redirect
        alert("Logged out successfully.");
        window.location.href = "../login.html";
      })
      .catch((error) => {
        alert("Logout failed: " + error.message);
      });
  });
}
