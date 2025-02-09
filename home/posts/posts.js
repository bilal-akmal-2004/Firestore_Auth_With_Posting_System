import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

//  Initialize Firebase
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
//  Redirect if user is not logged in
let userData = JSON.parse(localStorage.getItem("userData"));
if (!userData) {
  window.location.replace("../../signIn/signIn.html");
}

// this for saving all posts only one time
let savedPosts = [];

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
    showModal("New post created succesfully!");
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};
createNewPostButton.addEventListener("click", createNewPost);
// for creating new post and other stuff ends above-----------------------------------------

// for showing all of my post here is the functuons for that

//  Show My Posts
//
let mySavedPosts = [];

// Firestore real-time listener for My Posts
const q = query(collection(db, "posts"), where("id", "==", userData.id));

onSnapshot(q, (querySnapshot) => {
  mySavedPosts = []; // Clear old cache before updating

  querySnapshot.forEach((post) => {
    const postData = post.data();
    mySavedPosts.push({
      postHeading: postData.postHeading,
      postText: postData.postText,
      postId: post.id, // Ensure correct ID is stored
    });
  });

  console.log("Updated Posts:", mySavedPosts);
  //  Update UI automatically when Firestore changes
  showMyPosts();
});

// Function to display My Posts from cache
let showMyPosts = () => {
  try {
    showLoadingSpinner();
    myPostsDiv.innerHTML = `<h1 style="font-size: 65px; text-decoration: underline;">My Posts</h1>`;

    mySavedPosts.forEach((post) => {
      myPostsDiv.innerHTML += `
        <div class="post-item">
          <h2>${post.postHeading}</h2>
          <p>${post.postText}</p>
          <button class="btn btn-danger delete-btn" data-id="${post.postId}">Delete</button>
          <button class="btn btn-warning edit-btn" data-id="${post.postId}" data-heading="${post.postHeading}" data-text="${post.postText}">Edit</button>
        </div>
      `;
    });

    // Attach event listeners to Delete and Edit buttons
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        let postId = event.target.getAttribute("data-id");
        await deletePost(postId);
      });
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        let postId = event.target.getAttribute("data-id");
        let postHeading = event.target.getAttribute("data-heading");
        let postText = event.target.getAttribute("data-text");
        openEditModal(postId, postHeading, postText);
      });
    });
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};

// Delete Post (No need to manually refresh UI)
let deletePost = async (postId) => {
  try {
    showLoadingSpinner();
    await deleteDoc(doc(db, "posts", postId));
    showModal("Success in deletion");
  } catch (error) {
    console.error("Error deleting post:", error);
  } finally {
    hideLoadingSpinner();
  }
};

// Open Edit Modal
let openEditModal = (postId, postHeading, postText) => {
  document.getElementById("editPostHeading").value = postHeading;
  document.getElementById("editPostText").value = postText;
  document.getElementById("updatePostButton").setAttribute("data-id", postId);
  document.getElementById("editModal").style.display = "flex";
};

// Close Edit Modal
window.closeEditModal = () => {
  document.getElementById("editModal").style.display = "none";
};

// Update Post (No need to manually refresh UI)
let updatePost = async () => {
  try {
    showLoadingSpinner();
    let postId = document
      .getElementById("updatePostButton")
      .getAttribute("data-id");
    let updatedHeading = document.getElementById("editPostHeading").value;
    let updatedText = document.getElementById("editPostText").value;

    await updateDoc(doc(db, "posts", postId), {
      postHeading: updatedHeading,
      postText: updatedText,
    });

    showModal("Post updated successfully!");
    closeEditModal();
  } catch (error) {
    console.error("Error updating post:", error);
  } finally {
    hideLoadingSpinner();
  }
};

// Attach event listener to My Posts button
if (myPostButton) {
  myPostButton.addEventListener("click", () => {
    mainFormCreateUser.style.display = "none";
    allPostsDiv.style.display = "none";
    myPostsDiv.style.display = "block";
    showMyPosts();
  });
}

// Attach event listener to Update button inside modal
document
  .getElementById("updatePostButton")
  .addEventListener("click", updatePost);

// for showing all of my post here is the functuons for that ends above -------------------------

//now this is for the getiing all the post fucantion below
//  Listen for Real-Time Updates
onSnapshot(collection(db, "posts"), (snapshot) => {
  savedPosts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Cached Posts Updated:", savedPosts);
});

//  Function to Display Posts
const displayPosts = () => {
  let counterPost = 0;
  allPostsDiv.innerHTML = `<h1 style="font-size: 65px; 
    text-decoration: underline;
    text-transform: uppercase;">All Posts</h1>`;

  savedPosts.forEach((post) => {
    counterPost++;
    allPostsDiv.innerHTML += `<h1>${counterPost}: ${post.postHeading}</h1>
      <h3>${post.postText}</h3>`;
  });
};

//  Function to Get All Posts (Uses Cache First)
let getAllPosts = async () => {
  try {
    showLoadingSpinner();

    if (savedPosts.length > 0) {
      console.log("Using cached posts...");
      displayPosts();
    } else {
      console.log("Fetching posts from Firestore...");
      const posts = await getDocs(collection(db, "posts"));

      savedPosts = posts.docs.map((post) => ({
        id: post.id,
        ...post.data(),
      }));

      displayPosts();
    }
  } catch (error) {
    console.error(error);
  } finally {
    hideLoadingSpinner();
  }
};

//  Attach Event Listener to Button
allPostButton.addEventListener("click", () => {
  myPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "block";
  getAllPosts();
});
