import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  query,
  where,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ✅ Redirect if user is not logged in
let userData = JSON.parse(localStorage.getItem("userData"));
if (!userData) {
  window.location.replace("../../signIn/signIn.html");
}

// this for creaitng spinner for spingg loading css
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

let taskMakerDiv = document.querySelector("#taskMakerDiv");
let postHeading = document.querySelector("#postHeading");
let postText = document.querySelector("#postText");
let allPostButton = document.querySelector("#allPostButton");
let myPostButton = document.querySelector("#myPostButton");
let newPostButton = document.querySelector("#newPostButton");
let createNewPostButton = document.querySelector("#createNewPostButton");
let allPostsDiv = document.querySelector("#allPostsDiv");
allPostsDiv.style.display = "none";
let myPostsDiv = document.querySelector("#myPostsDiv");
myPostsDiv.style.display = "none";
let mainFormCreateUser = document.querySelector("#mainFormCreateUser");
mainFormCreateUser.style.display = "none";

// for creating new post and other stuff
newPostButton.addEventListener("click", () => {
  myPostsDiv.style.display = "none";
  allPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "block";
});
let createNewPost = async () => {
  try {
    showLoadingSpinner();
    const docRef = await addDoc(collection(db, "posts"), {
      postHeading: postHeading.value,
      postText: postText.value,
      id: userData.id,
    });
    console.log("Document written with ID: ", docRef.id);
    postHeading.value = ``;
    postText.value = ``;
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};
createNewPostButton.addEventListener("click", createNewPost);
// for creating new post and other stuff ends above-----------------------------------------

// for showing all of my post here is the functuons for that
let showMyPosts = async () => {
  try {
    showLoadingSpinner();
    const q = query(collection(db, "posts"), where("id", "==", userData.id));
    myPostsDiv.innerHTML = `<h1 style="font-size: 65px; 
      text-decoration: underline;
      
      text-transform: uppercase;">My Posts</h1>`;
    const querySnapshot = await getDocs(q);
    let counterPost = 0;
    querySnapshot.forEach((post) => {
      ++counterPost;
      // post.data() is never undefined for query post snapshots
      console.log(post.data());
      myPostsDiv.innerHTML += `<h1>${counterPost}: ${
        post.data().postHeading
      }</h1>
      <h3>${post.data().postText}</h3>`;
    });
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};
myPostButton.addEventListener("click", () => {
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "none";
  myPostsDiv.style.display = "block";
  showMyPosts();
});
// for showing all of my post here is the functuons for that ends above -------------------------

//now this is for the getiing all the post fucantion below
let getAllPosts = async () => {
  try {
    showLoadingSpinner();
    const posts = await getDocs(collection(db, "posts"));
    let counterPost = 0;
    allPostsDiv.innerHTML = `<h1 style="font-size: 65px; 
      text-decoration: underline;
      
      text-transform: uppercase;">All Posts</h1>`;
    posts.forEach((post) => {
      counterPost++;
      console.log(post.data());
      allPostsDiv.innerHTML += `<h1>${counterPost}: ${
        post.data().postHeading
      }</h1>
      <h3>${post.data().postText}</h3>`;
    });
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};
allPostButton.addEventListener("click", () => {
  myPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "block";
  getAllPosts();
});
