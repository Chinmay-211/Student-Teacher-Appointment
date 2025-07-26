// public/js/auth.js

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      // Step 1: Sign in using Firebase Authentication
      const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCred.user;

      // Step 2: Get user details from Firestore (e.g., role)
      const doc = await firebase.firestore().collection("users").doc(user.uid).get();

      if (!doc.exists) {
        alert("User data not found in Firestore.");
        return;
      }

      const userData = doc.data();

      // Step 3: Optionally check if the account is approved
      if (!userData.approved && userData.role !== "admin") {
        alert("Your account is not yet approved by admin.");
        return;
      }

      // Step 4: Redirect based on role
      if (userData.role === "student") {
        window.location.href = "./dashboard/student.html";
      } else if (userData.role === "teacher") {
        window.location.href = "./dashboard/teacher.html";
      } else if (userData.role === "admin") {
        window.location.href = "./dashboard/admin.html";
      } else {
        alert("Unknown role. Please contact admin.");
      }

    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}
