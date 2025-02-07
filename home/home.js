import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
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
if (!userData) {
  window.location.replace("../../signIn/signIn.html");
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
let message = document.querySelector("#message");
let logOut = document.querySelector("#logOut");
let loadingSpinner = document.getElementById("loading-spinner");

function showLoadingSpinner() {
  loadingSpinner.style.display = "flex";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

//-----------------modal functions----------------
let showModal = (message) => {
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("popupModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("popupModal").style.display = "none";
};
//-----------------modal functions end here----------------

// Check if user data exists
if (userData) {
  console.log(userData);

  try {
    showLoadingSpinner();
    // Fetch additional user data from Firestore
    const userRef = doc(db, "Users", userData.id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userFromDb = userSnap.data();

      if (userFromDb.section === undefined) {
        message.innerText = `Welcome !
          Name: ${userData.userName}
          Email: ${userData.email}
          Id: ${userData.id}
          `;
      } else {
        message.innerText = `Welcome !
          Name: ${userData.userName}
          Email: ${userData.email}
          Id: ${userData.id}
          Section: ${userFromDb.section}
          Gender: ${userFromDb.gender}
          `;
      }
    } else {
      console.log("No user data found in Firestore for UID:", userData.id);
      window.location.replace("../signIn/signIn.html");
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    showModal(
      "An error occurred while fetching your user data. Please try again."
    );
  } finally {
    // Optional: Hide loading spinner, if necessary
    hideLoadingSpinner();
  }
}

// Logout functionality
logOut.addEventListener("click", async () => {
  try {
    // Perform logout
    await signOut(auth);

    // Remove user data from local storage
    localStorage.removeItem("userData");

    // Inform the user of successful logout
    showModal("You have been logged out successfully.");

    // Redirect to the sign-in page
    window.location.replace("../signIn/signIn.html");
  } catch (error) {
    // Log the error to the console
    console.error("Error during sign-out:", error.message);

    // Notify the user of the issue
    showModal("An error occurred during logout. Please try again.");
  }
});
