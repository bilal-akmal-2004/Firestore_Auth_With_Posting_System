import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  onSnapshot,
  arrayUnion,
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

// this is for creating the time for our create new post area
let getTime = () => {
  let now = new Date();

  // Get date components
  let day = now.getDate();
  let month = now.getMonth() + 1; // Months start from 0, so add 1
  let year = now.getFullYear();

  // Get time components
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let amPm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12 || 12; // Converts 0 to 12

  // Ensure two-digit format for day, month, and minutes
  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  // Format the final string
  let formattedDate = `${day}/${month}/${year}`;
  let formattedTime = `${hours}:${minutes} ${amPm}`;

  console.log(`${formattedDate}, ${formattedTime}`);
  // Example output: "11/02/2025, 2:18 PM"
  return `${formattedDate}, ${formattedTime}`;
};

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
  let currenttime = getTime();

  try {
    showLoadingSpinner();
    const docRef = await addDoc(collection(db, "posts"), {
      postHeading: postHeading.value,
      postText: postText.value,
      id: userData.id,
      name: userData.userName,
      createdTime: currenttime,
      likedBy: [],
      comments: [],
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
      createdTime: postData.createdTime,
      updatedTime: postData.updatedTime,
    });
  });

  console.log("Updated Posts:", mySavedPosts);
  //  Update UI automatically when Firestore changes
  showMyPosts();
});

// Function to display My Posts from cache
let showMyPosts = () => {
  try {
    myPostsDiv.innerHTML = `<h1 style="font-size: 65px; text-decoration: underline;">My Posts</h1>`;

    mySavedPosts.forEach((post) => {
      myPostsDiv.innerHTML += `
        <div class="post-item">
          <h2>${post.postHeading}</h2>
          <p>${post.postText}</p>
          <h6>Created: ${post.updatedTime || post.createdTime} ${
        post.updatedTime ? "(Updated)" : ""
      }</h6>
          <button class="btn btn-danger delete-btn w-25" data-id="${
            post.postId
          }">Delete</button>
          <button class="btn btn-warning edit-btn w-25" data-id="${
            post.postId
          }" data-heading="${post.postHeading}" data-text="${
        post.postText
      }">Edit</button>
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
  let currenttime = getTime();
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
      updatedTime: currenttime,
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
    postUID: doc.id,
    ...doc.data(),
  }));
  console.log("Cached Posts Updated:", savedPosts);
  displayPosts();
});

// like button funcation yaaaaaaaaaaaaaaaaat?
// ✅ Like Button Function
const likeButton = async (postUID) => {
  console.log("Clicked Post UID:", postUID);

  if (!postUID) {
    console.error("Error: postUID is undefined!");
    return;
  }

  // ✅ Find the post in savedPosts (cached data)
  const post = savedPosts.find((p) => p.postUID === postUID);

  if (!post) {
    console.error("Error: Post not found in savedPosts.");
    return;
  }

  // ✅ Check if the user has already liked this post
  if (post.likedBy.includes(userData?.id)) {
    showModal("You already liked the post!");
    return; // ✅ Stop execution if already liked
  }

  try {
    const postRef = doc(db, "posts", postUID);

    // ✅ Update Firestore to add the like
    await updateDoc(postRef, {
      likedBy: arrayUnion(userData?.id),
    });

    console.log("Like added successfully!");

    // ✅ Update cached data immediately for faster UI updates
    post.likedBy.push(userData.id);

    // ✅ Refresh UI without fetching from Firestore
    displayPosts();
  } catch (error) {
    console.error("Error in likeButton:", error);
  }
};

// ✅ Function to Display Posts
// ✅ Function to Display Posts
const displayPosts = () => {
  allPostsDiv.innerHTML = `<h1 style="color: skyblue; font-size: 65px; text-decoration: underline; text-transform: uppercase;">All Posts</h1>`;

  savedPosts.forEach((post, index) => {
    allPostsDiv.insertAdjacentHTML(
      "beforeend",
      `<div style="display: flex; justify-content: center;">
        <div class="postDiv">
          <div class="nameAndTime">
            <h6><i class="fa-regular fa-user"></i> ${post.name}</h6>
            <h6><i class="fa-regular fa-calendar"></i> ${
              post.updatedTime || post.createdTime
            } ${post.updatedTime ? "(Updated)" : ""}</h6>
          </div>
          <h1>${index + 1}: ${post.postHeading}</h1>
          <h3>${post.postText}</h3>
          <div class="likeButton-And-Likes">
            <h4>Likes: ${post.likedBy.length}</h4>
            <button class="like-btn" data-postid="${
              post.postUID
            }">Like❤️</button>
          </div>
          <div class="comment-buttons">
            <button class="add-comment-btn btn btn-primary" data-postid="${
              post.postUID
            }">Add Comment 💬</button>
            <button class="view-comments-btn btn btn-primary" data-postid="${
              post.postUID
            }">View Comments (${
        post.comments ? post.comments.length : 0
      })</button>
          </div>
        </div>
      </div>`
    );
  });

  // ✅ Attach event listeners correctly
  document.querySelectorAll(".like-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postUID = this.dataset.postid;
      likeButton(postUID);
    });
  });

  document.querySelectorAll(".add-comment-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postUID = this.dataset.postid;
      openAddCommentModal(postUID);
    });
  });

  document.querySelectorAll(".view-comments-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postUID = this.dataset.postid;
      openViewCommentsModal(postUID);
    });
  });
};

// ✅ Function to Open Add Comment Modal
const openAddCommentModal = (postUID) => {
  console.log("Opening Add Comment Modal for Post ID:", postUID);
  const modal = document.getElementById("commentModal");
  if (!modal) {
    console.error("commentModal not found!");
    return;
  }
  modal.style.display = "flex";

  const confirmBtn = document.getElementById("confirmCommentBtn");
  if (!confirmBtn) {
    console.error("confirmCommentBtn not found!");
    return;
  }

  // ✅ Remove any existing event listeners to prevent duplicate listeners
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  const newConfirmBtn = document.getElementById("confirmCommentBtn");
  newConfirmBtn.dataset.postid = postUID;

  // ✅ Add event listener to submit the comment
  newConfirmBtn.addEventListener("click", async () => {
    await addCommentToPost(postUID);
  });
};

// ✅ Function to Add a Comment to Firestore
const addCommentToPost = async (postUID) => {
  const commentInput = document.getElementById("commentInput");
  if (!commentInput.value.trim()) {
    alert("Comment cannot be empty!");
    return;
  }

  const commentData = {
    comment: commentInput.value.trim(),
    name: userData.userName, // Assuming `userData` contains logged-in user info
    date: new Date().toLocaleString(),
  };

  try {
    const postRef = doc(db, "posts", postUID);

    // ✅ Add comment to Firestore using `arrayUnion`
    await updateDoc(postRef, {
      comments: arrayUnion(commentData),
    });

    console.log("Comment added successfully!");
    showModal("Comment added!");
    commentInput.value = ""; // Clear input field
    document.getElementById("commentModal").style.display = "none"; // Close modal
  } catch (error) {
    console.error("Error adding comment:", error);
    showModal("Failed to add comment. Please try again.");
  }
};

// ✅ Function to Open View Comments Modal
const openViewCommentsModal = (postUID) => {
  console.log("Opening View Comments Modal for Post ID:", postUID);
  const modal = document.getElementById("viewCommentsModal");
  if (!modal) {
    console.error("viewCommentsModal not found!");
    return;
  }

  // ✅ Find the post in the cached `savedPosts` array
  const postData = savedPosts.find((post) => post.postUID === postUID);

  if (!postData) {
    console.error("Post not found in cache!");
    showModal("Post not found!");
    return;
  }

  const commentsDiv = document.getElementById("commentsList");
  if (!commentsDiv) {
    console.error("commentsList not found!");
    return;
  }

  // ✅ Clear previous comments
  commentsDiv.innerHTML = "";

  if (!postData.comments || postData.comments.length === 0) {
    commentsDiv.innerHTML = "<p>No comments yet.</p>";
  } else {
    postData.comments.forEach((comment) => {
      commentsDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="comment">
           <p style="border-bottom: 1px solid black; border-radius: 10px; padding: 5px;">
           <strong>${comment.name}</strong> (${comment.date}):</p>
           <p>${comment.comment}</p>
         </div>`
      );
    });
  }

  modal.style.display = "flex"; // Show modal
};

// ✅ Function to Close Modals
document.querySelectorAll(".close-modal").forEach((button) => {
  button.addEventListener("click", function () {
    this.closest(".modal").style.display = "none";
  });
});

// ✅ Function to Fetch and Render Updated Posts
const getAllPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    savedPosts = querySnapshot.docs.map((doc) => ({
      postUID: doc.id,
      ...doc.data(),
    }));

    displayPosts(); // ✅ Re-render posts with updated data
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// ✅ Fetch posts when the page loads
getAllPosts();

//  Attach Event Listener to Button
allPostButton.addEventListener("click", () => {
  myPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "flex";
  getAllPosts();
});
