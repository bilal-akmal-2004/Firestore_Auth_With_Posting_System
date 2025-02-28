import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfgK34boUe0T77KFpteYvMRCYJ-aXOjqc",
  authDomain: "verysimpleuserform.firebaseapp.com",
  projectId: "verysimpleuserform",
  storageBucket: "verysimpleuserform.firebasestorage.app",
  messagingSenderId: "712556880799",
  appId: "1:712556880799:web:c9ae8ce0632ae17b68d3aa",
};

// ✅ Check if the user is already logged in
if (localStorage.getItem("userData")) {
  window.location.replace("../home/home.html");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let emailInp = document.querySelector("#emailInp");
let passwordInp = document.querySelector("#passwordInp");
let mainForm = document.querySelector("#mainForm");
let loadingSpinner = document.querySelector("#loading-spinner");

// ✅ Loading Spinner Functions
function showLoadingSpinner() {
  loadingSpinner.style.display = "flex";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

// ✅ Modal Functions
let showModal = (message) => {
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("popupModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("popupModal").style.display = "none";
};

// ✅ Validation Functions
let validateInput = (event) => {
  const input = event.target;
  let errorMessage = "";
  let span = input.nextElementSibling;

  // Validate email
  if (input === emailInp) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(input.value)) {
      errorMessage = "Please enter a valid email address.";
    }
  }

  // Validate password
  if (input === passwordInp) {
    if (input.value.length < 6) {
      errorMessage = "Password must be at least 6 characters long.";
    }
  }

  if (errorMessage) {
    if (!span || !span.classList.contains("error")) {
      if (span) span.remove();
      span = document.createElement("span");
      span.classList.add("error");
      span.textContent = errorMessage;
      input.parentNode.appendChild(span);
    }
  } else {
    if (span && span.classList.contains("error")) {
      span.remove();
    }
  }
};

// ✅ Attach validation to inputs
emailInp.addEventListener("input", validateInput);
passwordInp.addEventListener("input", validateInput);

// ✅ Sign-In Function (Updated to Firestore)
async function signIn(event) {
  event.preventDefault();

  if (!emailInp.value || !passwordInp.value) {
    showModal("Make sure to fill all the fields.");
    return;
  }

  try {
    showLoadingSpinner();
    const credentials = await signInWithEmailAndPassword(
      auth,
      emailInp.value,
      passwordInp.value
    );

    const uid = credentials.user.uid;
    console.log(credentials);

    // ✅ Fetch user data from Firestore instead of Realtime Database
    const userRef = doc(db, "Users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log(userData.firstName + " " + userData.lastName);

      if (!localStorage.getItem("userData")) {
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: uid,
            email: emailInp.value,
            userName: `${userData.firstName} ${userData.lastName}`,
            section: userData.section,
            gender: userData.gender,
          })
        );
        window.location.replace("../home/home.html");
      }
    } else {
      showModal("No user data found in Firestore for UID:", uid);
    }
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      showModal("This email is not registered!");
    }
    console.error("Sign-in error:", error.code, error.message);
  } finally {
    hideLoadingSpinner();
  }
}

mainForm.addEventListener("submit", signIn);

// ✅ Google Sign-In (Updated to Firestore)
const provider = new GoogleAuthProvider();
document.getElementById("google-login").addEventListener("click", async () => {
  try {
    showLoadingSpinner();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // ✅ Check if the user exists in Firestore
    const userRef = doc(db, "Users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("User exists:", user);

      if (!localStorage.getItem("userData")) {
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: user.uid,
            email: user.email,
            userName: user.displayName,
          })
        );
      }

      window.location.replace("../home/home.html");
    } else {
      console.log("User does not exist in Firestore.");
      showModal("You are not registered. Please register first.");
    }
  } catch (error) {
    console.error("Google Sign-In error:", error.message);

    if (error.code === "auth/popup-closed-by-user") {
      showModal("Popup closed before completing the sign-in process.");
    } else if (error.message.includes("database")) {
      showModal(
        "An error occurred while verifying your account. Please try again later."
      );
    } else {
      showModal(`Error during sign-in: ${error.message}`);
    }
  } finally {
    hideLoadingSpinner();
  }
});
