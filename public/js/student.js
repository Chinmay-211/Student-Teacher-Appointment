let currentUser;
const teacherList = document.getElementById("teacherList");
const searchBox = document.getElementById("searchBox");
const teacherSelect = document.getElementById("teacherSelect");
const appointmentsList = document.getElementById("appointmentsList");
const bookForm = document.getElementById("bookForm");

// ✅ Auth and approval check
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  currentUser = user;

  const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data().role !== "student" || !userDoc.data().approved) {
    alert("Access denied. Your registration is pending approval.");
    firebase.auth().signOut();
    return;
  }

  document.querySelector("h2").textContent = `Welcome, ${userDoc.data().name}`;
  loadTeachers();
  loadAppointments();
  populateMessageTeacherDropdown();
});

// 🔍 Load & Filter Teachers
searchBox.addEventListener("input", loadTeachers);

async function loadTeachers() {
  const query = searchBox.value.toLowerCase().trim();
  const snapshot = await firebase.firestore().collection("teachers").get();

  teacherList.innerHTML = "";
  teacherSelect.innerHTML = '<option value="">-- Choose a Teacher --</option>';

  snapshot.forEach((doc) => {
    const data = doc.data();
    const match = data.name.toLowerCase().includes(query) || data.subject.toLowerCase().includes(query);

    if (match) {
      // For teacher list display
      const li = document.createElement("li");
      li.innerHTML = `<strong>${data.name}</strong> - ${data.subject} (${data.department})`;
      teacherList.appendChild(li);

      // For dropdown
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.name} - ${data.subject}`;
      teacherSelect.appendChild(option);
    }
  });

  if (teacherList.innerHTML === "") {
    teacherList.innerHTML = "<li>No matching teachers found.</li>";
  }
}

// 🗓️ Book Appointment Form Submit
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherId = teacherSelect.value;
  const dateTime = document.getElementById("appointmentDateTime").value;

  if (!teacherId || !dateTime) {
    alert("Please select a teacher and date/time.");
    return;
  }

  try {
    await firebase.firestore().collection("appointments").add({
      teacherId,
      studentId: currentUser.uid,
      dateTime,
      status: "pending"
    });
    alert("Appointment booked!");
    bookForm.reset();
    loadAppointments();
  } catch (err) {
    alert("Error booking appointment: " + err.message);
  }
});

// 📖 Load Student Appointments
async function loadAppointments() {
  appointmentsList.innerHTML = "";

  const snapshot = await firebase.firestore()
    .collection("appointments")
    .where("studentId", "==", currentUser.uid)
    .orderBy("dateTime")
    .get();

  if (snapshot.empty) {
    appointmentsList.innerHTML = "<li>No appointments yet.</li>";
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const teacherDoc = await firebase.firestore().collection("teachers").doc(data.teacherId).get();
    const teacher = teacherDoc.exists ? teacherDoc.data().name : "Unknown";

    const li = document.createElement("li");
    li.innerHTML = `With <strong>${teacher}</strong> at <em>${data.dateTime}</em> - Status: <b>${data.status}</b>`;
    appointmentsList.appendChild(li);
  }
}
// 📥 Populate Teacher List for Messaging
async function populateMessageTeacherDropdown() {
  const select = document.getElementById("teacherMessageSelect");
  select.innerHTML = `<option value="">-- Choose a Teacher --</option>`;

  const snapshot = await firebase.firestore().collection("teachers").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${data.name} (${data.subject})`;
    select.appendChild(option);
  });
}

// 💬 Handle Message Sending
document.getElementById("sendMessageForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const to = document.getElementById("teacherMessageSelect").value;
  const content = document.getElementById("messageContent").value.trim();

  if (!to || !content) {
    alert("Please select a teacher and enter a message.");
    return;
  }

  try {
    await firebase.firestore().collection("messages").add({
      from: currentUser.uid,
      to,
      content,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Message sent!");
    document.getElementById("sendMessageForm").reset();
  } catch (err) {
    alert("Failed to send message: " + err.message);
  }
});
