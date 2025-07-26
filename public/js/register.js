// public/js/register.js

const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = "student"; // ✅ Hardcoded role

    try {
      // 1. Create user in Firebase Auth
      const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCred.user;
      const uid = user.uid;

      // 2. Save user in 'users' collection
      await firebase.firestore().collection("users").doc(uid).set({
        name,
        email,
        role,
        approved: false
      });

      // 3. Save in 'students' collection only
      await firebase.firestore().collection("students").doc(uid).set({
        name,
        email,
        role,
        approved: false
      });

      alert("Registration successful! Await admin approval.");
      window.location.href = "./login.html";
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  });
}
