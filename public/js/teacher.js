let currentUser;
const appointmentTable = document.getElementById('appointmentTable').getElementsByTagName('tbody')[0];
const messageList = document.getElementById('messageList');

// Auth check
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  currentUser = user;

  const teacherDoc = await firebase.firestore().collection("teachers").doc(user.uid).get();
  const teacherData = teacherDoc.exists ? teacherDoc.data() : null;

  if (teacherData) {
    document.querySelector("h2").textContent = `Welcome, ${teacherData.name}`;
  }

  loadAppointments();
  loadMessages();
});

// 🔘 Load Appointments
async function loadAppointments() {
  appointmentTable.innerHTML = ""; // Clear existing rows

  const snapshot = await firebase.firestore()
    .collection("appointments")
    .where("teacherId", "==", currentUser.uid)
    .get();

  if (snapshot.empty) {
    appointmentTable.innerHTML = `<tr><td colspan="4">No appointments found.</td></tr>`;
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const studentDoc = await firebase.firestore().collection("students").doc(data.studentId).get();
    const student = studentDoc.exists ? studentDoc.data() : { name: "Unknown" };

    const row = document.createElement("tr");
   row.innerHTML = `
  <td>${student.name}</td>
  <td>${data.dateTime}</td>
  <td>${data.status}</td>
  <td>
    ${data.status === "pending"
      ? `<button class="action-btn approve" onclick="approve('${doc.id}')">Approve</button>
         <button class="action-btn reject" onclick="cancel('${doc.id}')">Cancel</button>`
      : ""}
    <button class="action-btn delete" onclick="deleteAppointment('${doc.id}')">Delete</button>
  </td>
`;

    appointmentTable.appendChild(row);
  }
}

window.approve = async (id) => {
  await firebase.firestore().collection("appointments").doc(id).update({ status: "approved" });
  alert("Appointment approved.");
  loadAppointments();
};

window.cancel = async (id) => {
  await firebase.firestore().collection("appointments").doc(id).update({ status: "cancelled" });
  alert("Appointment cancelled.");
  loadAppointments();
};

window.deleteAppointment = async (id) => {
  if (!confirm("Are you sure you want to delete this appointment?")) return;
  await firebase.firestore().collection("appointments").doc(id).delete();
  alert("Appointment deleted.");
  loadAppointments();
};

// 🔘 Load Messages
async function loadMessages() {
  const snapshot = await firebase.firestore()
    .collection("messages")
    .where("to", "==", currentUser.uid)
    .orderBy("timestamp", "desc")
    .get();

  messageList.innerHTML = "";

  if (snapshot.empty) {
    messageList.innerHTML = "<tr><td colspan='4'>No messages from students.</td></tr>";
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const studentDoc = await firebase.firestore()
      .collection("students")
      .doc(data.from)
      .get();   

    const student = studentDoc.exists ? studentDoc.data() : { name: "Unknown" };
    const timestamp = data.timestamp?.toDate().toLocaleString() || "N/A";

    const row = document.createElement("tr");
   row.innerHTML = `
  <td>${student.name}</td>
  <td>${data.content}</td>
  <td>${timestamp}</td>
  <td><button class="action-btn delete" onclick="deleteMessage('${doc.id}')">Delete</button></td>
`;

    messageList.appendChild(row);
  }
}
