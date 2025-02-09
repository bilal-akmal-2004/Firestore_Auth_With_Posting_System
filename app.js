import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
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

// ✅ Redirect if user is already logged in
if (localStorage.getItem("userData"))
  window.location.replace("./home/home.html");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let emailInp = document.querySelector("#emailInp");
let passwordInp = document.querySelector("#passwordInp");
let fnameInp = document.querySelector("#fnameInp");
let lnameInp = document.querySelector("#lnameInp");
let mainForm = document.querySelector("#mainForm");
let selectBox = document.querySelector("#selectBox");
let inlineRadio1 = document.querySelector("#inlineRadio1");
let inlineRadio2 = document.querySelector("#inlineRadio2");

let loadingSpinner = document.getElementById("loading-spinner");

function showLoadingSpinner() {
  loadingSpinner.style.display = "flex";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

let showModal = (message) => {
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("popupModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("popupModal").style.display = "none";
};

let validateInput = (event) => {
  const input = event.target;
  let errorMessage = "";

  let span = input.nextElementSibling;

  if (input === emailInp) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(input.value)) {
      errorMessage = "Invalid email address.";
    }
  }

  if (input === passwordInp) {
    if (input.value.length < 6) {
      errorMessage = "Password must be at least 6 characters long.";
    }
  }

  if (input === fnameInp) {
    if (input.value.trim().length < 2) {
      errorMessage = "First name must be at least 2 characters long.";
    }
  }

  if (input === lnameInp) {
    if (input.value.trim().length < 2) {
      errorMessage = "Last name must be at least 2 characters long.";
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

emailInp.addEventListener("input", validateInput);
passwordInp.addEventListener("input", validateInput);
fnameInp.addEventListener("input", validateInput);
lnameInp.addEventListener("input", validateInput);

// ✅ Register User & Store in Firestore
let registerData = async (event) => {
  event.preventDefault();

  if (
    !emailInp.value ||
    !passwordInp.value ||
    !fnameInp.value ||
    !lnameInp.value ||
    selectBox.value === "Select the section" ||
    (!inlineRadio1.checked && !inlineRadio2.checked)
  ) {
    showModal("Make sure to fill all the fields.");
    return;
  }

  const radioValue = () =>
    inlineRadio1.checked ? inlineRadio1.value : inlineRadio2.value;

  try {
    showLoadingSpinner();
    const credentials = await createUserWithEmailAndPassword(
      auth,
      emailInp.value,
      passwordInp.value
    );
    const firebaseUser = credentials.user;
    const { uid } = firebaseUser;

    await setDoc(doc(collection(db, "Users"), uid), {
      id: uid,
      firstName: fnameInp.value,
      lastName: lnameInp.value,
      email: emailInp.value,
      section: selectBox.value,
      gender: radioValue(),
    });

    console.log("Data written successfully!");
    showModal("Data stored successfully.");

    if (!localStorage.getItem("userData")) {
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: uid,
          email: emailInp.value,
          userName: `${fnameInp.value} ${lnameInp.value}`,
          section: selectBox.value,
          gender: radioValue(),
        })
      );
    }
    window.location.replace("./home/home.html");
  } catch (error) {
    if (error.code === `auth/email-already-in-use`) {
      showModal("Email already exists.");
    } else if (error.code === `auth/weak-password`) {
      showModal("Password should be at least 6 characters long.");
    }
    console.error("Error:", error.code, error.message);
  } finally {
    hideLoadingSpinner();
  }
};

mainForm.addEventListener("submit", registerData);
const provider = new GoogleAuthProvider();

// ✅ Google Sign-In & Firestore User Storage
document.getElementById("google-login").addEventListener("click", async () => {
  try {
    showLoadingSpinner();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    console.log("User Info:", user);
    console.log("Token:", token);

    const userRef = doc(db, "Users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        firstName: user.displayName,
        email: user.email,
      });
      console.log("User data stored successfully.");
    } else {
      console.log("User already exists in the database.");
    }

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

    window.location.replace("./home/home.html");
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    if (error.code === "auth/popup-closed-by-user") {
      showModal("Popup closed before completing the sign-in process.");
    } else {
      showModal(`Error during sign-in: ${error.message}`);
    }
  } finally {
    hideLoadingSpinner();
  }
});
