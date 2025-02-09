import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfgK34boUe0T77KFpteYvMRCYJ-aXOjqc",
  authDomain: "verysimpleuserform.firebaseapp.com",
  projectId: "verysimpleuserform",
  storageBucket: "verysimpleuserform.firebasestorage.app",
  messagingSenderId: "712556880799",
  appId: "1:712556880799:web:c9ae8ce0632ae17b68d3aa",
};

// ✅ Redirect if user is not logged in
let userData = JSON.parse(localStorage.getItem("userData"));
if (!userData) window.location.replace("../../signIn/signIn.html");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let emailInp = document.querySelector("#emailInp");
let message = document.querySelector("#message");

// --- Loading Spinner ---
let loadingSpinner = document.getElementById("loading-spinner");

function showLoadingSpinner() {
  loadingSpinner.style.display = "flex";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

// ----------------- Modal Functions ----------------
let showModal = (message) => {
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("popupModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("popupModal").style.display = "none";
};

// --- Function to Fetch User by Email (Firestore) ---
const getUser = async () => {
  try {
    showLoadingSpinner();

    // Reference to Firestore "Users" collection
    const usersRef = collection(db, "Users");

    // Query to find user by email
    const q = query(usersRef, where("email", "==", emailInp.value));

    // Get the documents
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      showModal("No user found.");
      console.log("No user found.");
      message.innerText = `No user Found!`;
      return;
    }

    // Process user data
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.section === undefined) {
        message.innerText = `User Data:
          Name: ${data.firstName}
          Email: ${data.email}
          Id: ${data.id}
        `;
      } else {
        message.innerText = `User Data:
          Name: ${data.firstName} ${data.lastName}
          Email: ${data.email}
          Id: ${data.id}
          Section: ${data.section}
          Gender: ${data.gender}
        `;
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
  } finally {
    hideLoadingSpinner();
  }
};

// Search Button Event Listener
let searchButton = document.querySelector("#searchButton");

searchButton.addEventListener("click", getUser);
