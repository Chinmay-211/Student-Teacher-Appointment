// public/js/admin.js

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    alert("You must be logged in as admin.");
    window.location.href = "../login.html";
    return;
  }

  try {
    const uid = user.uid;
    const docRef = firebase.firestore().collection("users").doc(uid);
    const docSnap = await docRef.get();

    console.log("Logged in UID:", uid);
    console.log("User data:", docSnap.data());

    if (!docSnap.exists || docSnap.data().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../login.html";
      return;
    }

    // ✅ Load unapproved users
    const snapshot = await firebase.firestore()
      .collection("users")
      .where("approved", "==", false)
      .get();

    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    if (snapshot.empty) {
      userList.innerHTML = "<li>No users pending approval.</li>";
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.name}</strong> (${data.email}) - ${data.role}
        <button onclick="approveUser('${doc.id}')">Approve</button>
      `;
      userList.appendChild(li);
    });

    // ✅ Load teacher list
    loadTeachers();

  } catch (err) {
    alert("Error loading admin data: " + err.message);
  }
});

async function approveUser(userId) {
  try {
    const userRef = firebase.firestore().collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return alert("User not found!");

    const data = userSnap.data();

    await userRef.update({ approved: true });

    // ✅ Sync to appropriate collection
    if (data.role === "student") {
      await firebase.firestore().collection("students").doc(userId).set({
        name: data.name,
        email: data.email,
        role: "student",
        approved: true
      });
    } else if (data.role === "teacher") {
      await firebase.firestore().collection("teachers").doc(userId).set({
        name: data.name,
        email: data.email,
        subject: "",
        department: "",
        role: "teacher",
        approved: true
      });
    }

    alert("User approved and synced!");
    location.reload();
  } catch (err) {
    alert("Error approving user: " + err.message);
  }
}

// ✅ Add New Teacher with Secondary App
const addTeacherForm = document.getElementById("addTeacherForm");

if (addTeacherForm) {
  addTeacherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("teacherName").value.trim();
    const email = document.getElementById("teacherEmail").value.trim();
    const password = document.getElementById("teacherPassword").value;
    const dept = document.getElementById("teacherDepartment").value.trim();
    const subj = document.getElementById("teacherSubject").value.trim();

    const secondaryApp = firebase.initializeApp(firebase.app().options, "Secondary");

    try {
      const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
      const user = userCred.user;

      await firebase.firestore().collection("users").doc(user.uid).set({
        name,
        email,
        role: "teacher",
        approved: true
      });

      await firebase.firestore().collection("teachers").doc(user.uid).set({
        name,
        email,
        department: dept,
        subject: subj,
        role: "teacher",
        approved: true
      });

      alert("Teacher added!");
      addTeacherForm.reset();

      await secondaryApp.auth().signOut();
      await secondaryApp.delete();
      loadTeachers(); // Refresh list
    } catch (err) {
      alert("Error adding teacher: " + err.message);
    }
  });
}

// ✅ Load and Display Teachers
async function loadTeachers() {
  const teacherList = document.getElementById("teacherList");
  if (!teacherList) return;

  teacherList.innerHTML = "";

  try {
    const snapshot = await firebase.firestore().collection("teachers").get();

    if (snapshot.empty) {
      teacherList.innerHTML = "<li>No teachers found.</li>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.name}</strong> - ${data.subject} (${data.department})
        <button onclick="deleteTeacher('${doc.id}')">Delete</button>
      `;
      teacherList.appendChild(li);
    });
  } catch (err) {
    alert("Error loading teachers: " + err.message);
  }
}

// ✅ Delete Teacher
window.deleteTeacher = async (uid) => {
  if (!confirm("Are you sure you want to delete this teacher?")) return;

  try {
    await firebase.firestore().collection("teachers").doc(uid).delete();
    await firebase.firestore().collection("users").doc(uid).delete();

    alert("Teacher deleted.");
    loadTeachers();
  } catch (err) {
    alert("Error deleting teacher: " + err.message);
  }
};
