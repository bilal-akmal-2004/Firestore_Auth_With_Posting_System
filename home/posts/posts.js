import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  orderBy,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js"; // 🔄 Updated to match the correct version

// 1️⃣ Initialize Firebase for Firestore & Authentication
const firebaseConfig = {
  apiKey: "AIzaSyDfgK34boUe0T77KFpteYvMRCYJ-aXOjqc",
  authDomain: "verysimpleuserform.firebaseapp.com",
  projectId: "verysimpleuserform",
  storageBucket: "verysimpleuserform.appspot.com",
  messagingSenderId: "712556880799",
  appId: "1:712556880799:web:c9ae8ce0632ae17b68d3aa",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2️⃣ Initialize Firebase for Storage (Separate Project)
const firebaseStorageConfig = {
  apiKey: "AIzaSyB3-XCcQY4HSnksvDIf2a7rxJvVr7lA4E0",
  authDomain: "app-development-assignment-1.firebaseapp.com",
  projectId: "app-development-assignment-1",
  storageBucket: "app-development-assignment-1.appspot.com",
  messagingSenderId: "1063054144697",
  appId: "1:1063054144697:web:c9c3f68dcce4973484fd768",
};

// 🔥 Initialize the second Firebase project with a different name
const storageApp = initializeApp(firebaseStorageConfig, "storageApp");

// ✅ Ensure getStorage is using `storageApp`
const storage = getStorage(storageApp);

//  Redirect if user is not logged in
let userData = JSON.parse(localStorage.getItem("userData"));
if (!userData) {
  window.location.replace("../../signIn/signIn.html");
}

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
let freindRequests = document.getElementById("freindRequests");
let chatWithFriends = document.getElementById("chatWithFriends");
let modalContent = document.querySelector(".modal-content");
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
  document.getElementById("modalMessage").innerHTML = message;
  document.getElementById("popupModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("popupModal").style.display = "none";
  modalContent.style.height = "";
};
//-----------------modal functions end here----------------

// for creating new post and other stuff
newPostButton.addEventListener("click", () => {
  myPostsDiv.style.display = "none";
  allPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "block";
  // ✅ Animate form when it appears
  gsap.from("#mainFormCreateUser", {
    opacity: 0,
    scale: 0.4, // Start slightly smaller
    duration: 0.8,
    ease: "power2.out",
  });
});

let createNewPost = async () => {
  let currenttime = getTime();
  let imageFile = document.getElementById("postImage").files[0];

  // 🔴 Check if required fields are empty
  if (!postHeading.value.trim() || !postText.value.trim() || !imageFile) {
    showModal("Fill the fields first.");
    return;
  }

  try {
    showLoadingSpinner();
    let imageURL = null; // Default if no image is uploaded

    // ✅ Upload image if selected
    if (imageFile) {
      const uniqueImageName = `${Date.now()}_${imageFile.name}`; // Unique name to avoid overwrites
      const imageRef = ref(storage, `postsPictures/${uniqueImageName}`);
      await uploadBytes(imageRef, imageFile);
      imageURL = await getDownloadURL(imageRef);
    }

    // ✅ Save post in Firestore
    const docRef = await addDoc(collection(db, "posts"), {
      postHeading: postHeading.value,
      postText: postText.value,
      id: userData.id,
      name: userData.userName,
      createdTime: currenttime,
      likedBy: [],
      comments: [],
      imageUrl: imageURL, // 🖼️ Store image URL (null if no image)
    });

    console.log("Document written with ID: ", docRef.id);

    // ✅ Clear form fields
    postHeading.value = ``;
    postText.value = ``;
    document.getElementById("postImage").value = ``;

    showModal("New post created successfully!");
  } catch (error) {
    console.error("Error creating post: ", error);
  } finally {
    hideLoadingSpinner();
  }
};
// ✅ Attach event listener
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
      imageUrl: postData.imageUrl || null, // Include image URL (null if no image)
    });
  });

  console.log("Updated Posts:", mySavedPosts);
  // Update UI automatically when Firestore changes
  showMyPosts();
});

// Function to display My Posts from cache
// ✅ Function to display My Posts from cache with GSAP Animation
let showMyPosts = () => {
  try {
    myPostsDiv.innerHTML = `<h1 style="padding: 10px; font-size: 25px; text-align: center;">My Posts</h1>`;

    mySavedPosts.forEach((post) => {
      myPostsDiv.innerHTML += `
        <div style="text-align:center;" class="postDiv">
          <h2>${post.postHeading}</h2>
          <p>${post.postText}</p>
          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 10px;">`
              : ""
          }
          <h6 class="mt-3">Created: ${post.updatedTime || post.createdTime} ${
        post.updatedTime ? "(Updated)" : ""
      }</h6>
      
          <div>
            <button class="btn btn-danger delete-btn w-25" data-id="${
              post.postId
            }">Delete</button>
            <button class="btn btn-warning edit-btn w-25" data-id="${
              post.postId
            }" 
              data-heading="${post.postHeading}" 
              data-text="${post.postText}" 
              data-image="${post.imageUrl || ""}">Edit</button>
          </div>
        </div>
      `;
    });

    // ✅ GSAP Animation: Smooth fade-in with slight scaling
    gsap.from(".postDiv", {
      opacity: 0,
      scale: 0.5, // Slightly smaller on load
      duration: 0.8,
      ease: "power2.in",
    });
    gsap.from(".postDiv img", {
      opacity: 0,
      scale: 0.5, // Slightly smaller on load
      delay: 0.8,
      duration: 0.8,
      ease: "power2.in",
    });

    // ✅ Attach event listeners to Delete and Edit buttons
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
        let postImage = event.target.getAttribute("data-image");
        openEditModal(postId, postHeading, postText, postImage);
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

// Open Edit Modal (Now includes Image)
let openEditModal = (postId, postHeading, postText, postImage) => {
  document.getElementById("editPostHeading").value = postHeading;
  document.getElementById("editPostText").value = postText;
  document.getElementById("updatePostButton").setAttribute("data-id", postId);

  let editImagePreview = document.getElementById("editImagePreview");

  if (postImage && postImage !== "undefined") {
    editImagePreview.src = postImage;
    editImagePreview.style.display = "block";
  } else {
    editImagePreview.style.display = "none";
  }

  // Clear previous file selection
  document.getElementById("editPostImage").value = "";

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
    showLoadingSpinner(); // Start loading
    await new Promise((resolve) => setTimeout(resolve, 100)); // ✅ Allow UI update

    let postId = document
      .getElementById("updatePostButton")
      .getAttribute("data-id");
    let updatedHeading = document.getElementById("editPostHeading").value;
    let updatedText = document.getElementById("editPostText").value;
    let newImageFile = document.getElementById("editPostImage").files[0];

    let updatedData = {
      postHeading: updatedHeading,
      postText: updatedText,
      updatedTime: currenttime,
    };

    // ✅ Handle image upload properly
    if (newImageFile) {
      let storageRef = ref(
        storage,
        `postImages/${postId}-${newImageFile.name}`
      );

      // Start image upload and show progress
      let uploadTask = uploadBytesResumable(storageRef, newImageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          let progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload Progress:", progress + "%");
        },
        (error) => {
          console.error("Upload Error:", error);
        },
        async () => {
          let newImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          updatedData.imageUrl = newImageUrl; // ✅ Save new image URL

          // ✅ Now update Firestore after image is uploaded
          await updateDoc(doc(db, "posts", postId), updatedData);

          showModal("Post updated successfully!");
          closeEditModal();
        }
      );
    } else {
      // ✅ If no new image, update Firestore directly
      await updateDoc(doc(db, "posts", postId), updatedData);
      showModal("Post updated successfully!");
      closeEditModal();
    }
  } catch (error) {
    console.error("Error updating post:", error);
  } finally {
    setTimeout(() => {
      hideLoadingSpinner();
    }, 2000);
    // Ensure loading stops even on error
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

// Listen for Real-Time Updates (All Posts)
onSnapshot(collection(db, "posts"), (snapshot) => {
  savedPosts = snapshot.docs.map((doc) => ({
    postUID: doc.id,
    ...doc.data(),
    imageUrl: doc.data().imageUrl || null, // Include image URL (null if no image)
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
const displayPosts = () => {
  allPostsDiv.innerHTML = `<h1 class="allPostHeading">All Posts</h1>`;

  savedPosts.forEach((post, index) => {
    allPostsDiv.insertAdjacentHTML(
      "beforeend",
      `<div style="display: flex; justify-content: center;">
        <div class="postDiv" style="opacity: 0; transform: translateX(-50px);">
          <div class="nameAndTime">
            <h6><i class="fa-regular fa-user"></i> ${post.name}</h6>
            <h6>
              <button class="addFreind" data-userid="${post.id}">
                <i class="fa-solid fa-user-plus"></i>
              </button>
              <i class="fa-regular fa-calendar"></i> ${
                post.updatedTime || post.createdTime
              } ${post.updatedTime ? "(Updated)" : ""}
            </h6>
          </div>
          <h1>${post.postHeading}</h1>
          <h3>${post.postText}</h3>

          <!-- ✅ Display Image Below Post Text (Only if Available) -->
          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" alt="Post Image" class="postImage">`
              : ""
          }

          <div class="likeButton-And-Likes">
            <button class="like-btn" data-postid="${
              post.postUID
            }">Like❤️</button>
            <div class="displayLikesAndLikedBy">
              <button class="liked-by-btn likedByButton" data-postid="${
                post.postUID
              }">Liked By 👥</button>
              <h4>Likes: ${post.likedBy.length}</h4>
            </div>
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

  // ✅ Attach event listeners
  document.querySelectorAll(".addFreind").forEach((button) => {
    button.addEventListener("click", function () {
      const recipientUID = this.dataset.userid;
      sendFriendRequest(recipientUID);
    });
  });

  document.querySelectorAll(".like-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postUID = this.dataset.postid;
      likeButton(postUID);
    });
  });

  document.querySelectorAll(".liked-by-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postUID = this.dataset.postid;
      openLikedByModal(postUID);
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

  // ✅ GSAP Animation for Slide-In from Left on Scroll
  gsap.utils.toArray(".postDiv").forEach((post, index) => {
    gsap.to(post, {
      scrollTrigger: {
        trigger: post,
        start: "top 85%", // Animation starts when 85% of post enters viewport
        toggleActions: "play none none none", // Runs once
      },
      x: 0, // Move back to normal position
      opacity: 1,
      duration: 0.8,
      delay: index * 0.1, // Creates a wave effect
      ease: "power2.out",
    });
  });
  gsap.from(".postDiv img", {
    y: -220,
    opacity: 0,
    duration: 0.6,
    delay: 1.1,
    ease: "back.out(4)",
  });
};

const sendFriendRequest = async (recipientUID) => {
  try {
    // Get a reference to the recipient's document in the "Users" collection
    const userRef = doc(db, "Users", recipientUID);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      showModal("Recipient not found.");
      return;
    }

    const recipientData = userSnap.data();

    // Check if the current user already sent a friend request
    if (
      recipientData.friendRequests &&
      recipientData.friendRequests.includes(userData.id)
    ) {
      showModal("Friend request already sent!");
      return;
    }

    // Check if they are already friends
    if (recipientData.friends && recipientData.friends.includes(userData.id)) {
      showModal("You are already friends!");
      return;
    }
    if (recipientUID === userData.id) {
      showModal("You cannot send a friend request to yourself!");
      return;
    }

    // If all checks pass, add the current user's UID to the recipient's friendRequests array
    await updateDoc(userRef, {
      friendRequests: arrayUnion(userData.id),
    });

    showModal("Friend request sent!");
  } catch (error) {
    console.error("Error sending friend request:", error);
    showModal("Failed to send friend request. Please try again.");
  }
};

const openLikedByModal = async (postUID) => {
  const post = savedPosts.find((p) => p.postUID === postUID);

  if (!post || !post.likedBy || post.likedBy.length === 0) {
    showModal("No likes yet!");
    return;
  }

  try {
    // Fetch details for each user in the likedBy array
    const likedUserPromises = post.likedBy.map(async (userUID) => {
      const userDocSnap = await getDoc(doc(db, "Users", userUID));
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        // Combine first and last names if available
        return data.firstName + (data.lastName ? " " + data.lastName : "");
      }
      return "Unknown User";
    });

    const likedUserNames = await Promise.all(likedUserPromises);

    // Build modal content
    let modal = document.createElement("dialog");
    modal.setAttribute("id", "likedByModal");
    modal.innerHTML = `
      <div style="text-align: center; padding: 20px; border-radius: 10px; background: white; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
        <h2>Liked By:</h2>
        <ul>
          ${likedUserNames.map((name) => `<li>${name}</li>`).join("")}
        </ul>
        <button class="btn btn-primary" id="closeLikedByModal">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.showModal();

    // Close button functionality
    document
      .getElementById("closeLikedByModal")
      .addEventListener("click", () => {
        modal.close();
        modal.remove();
      });
  } catch (error) {
    console.error("Error fetching liked users:", error);
    showModal("Error fetching liked users");
  }
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

// Function to show friend requests in a modal
const showFriendRequests = async () => {
  try {
    showLoadingSpinner();
    const userDocRef = doc(db, "Users", userData.id);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const friendRequests = data.friendRequests || [];

      if (friendRequests.length === 0) {
        showModal("No requests available");
      } else {
        const friendRequestsInfo = await Promise.all(
          friendRequests.map(async (friendUID) => {
            const friendDocSnap = await getDoc(doc(db, "Users", friendUID));
            if (friendDocSnap.exists()) {
              const friendData = friendDocSnap.data();
              return {
                uid: friendUID,
                name: `${friendData.firstName} ${friendData.lastName || ""}`,
              };
            } else {
              return { uid: friendUID, name: "Unknown User" };
            }
          })
        );

        let requestsHtml = "<ul>";
        friendRequestsInfo.forEach((info) => {
          requestsHtml += `<li>
            ${info.name} 
            <button class="accept-btn btn btn-success" data-uid="${info.uid}">Accept</button>
          </li>`;
        });
        requestsHtml += "</ul>";

        // ✅ Create modal dynamically
        let modal = document.createElement("dialog");
        modal.setAttribute("id", "friendRequestsModal");
        modal.innerHTML = `
          <div class="friendRequestModal">
            <h2>Friend Requests</h2>
            <h5>${requestsHtml}</h5>
            <button id="closeFriendRequestsModal" class="btn btn-primary">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        modal.showModal();

        // ✅ Animate modal appearance with GSAP
        gsap.from(".friendRequestModal", {
          y: -50,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });

        // ✅ Accept friend request animation
        document.querySelectorAll(".accept-btn").forEach((button) => {
          button.addEventListener("click", async function () {
            const friendUID = this.dataset.uid;
            await acceptFriendRequest(friendUID);

            // Animate removal of request
            gsap.to(this.parentElement, {
              opacity: 0,
              height: 0,
              duration: 0.4,
              onComplete: () => this.parentElement.remove(),
            });
          });
        });

        // ✅ Close button with animation
        document
          .getElementById("closeFriendRequestsModal")
          .addEventListener("click", () => {
            gsap.to(".friendRequestModal", {
              y: -50,
              opacity: 0,
              duration: 0.6,
              ease: "power2.in",
              onComplete: () => {
                modal.close();
                modal.remove();
              },
            });
          });
      }
    } else {
      showModal("User document not found");
    }
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    showModal("Error fetching friend requests");
  } finally {
    setTimeout(() => {
      hideLoadingSpinner();
    }, 500);
  }
};

// Function to accept a friend request
const acceptFriendRequest = async (friendUID) => {
  try {
    // Update current user's document: remove friendUID from friendRequests and add it to friends
    const userDocRef = doc(db, "Users", userData.id);
    await updateDoc(userDocRef, {
      friendRequests: arrayRemove(friendUID),
      friends: arrayUnion(friendUID),
    });

    // Optionally, update the friend's document to add current user's UID to their friends array
    const friendDocRef = doc(db, "Users", friendUID);
    await updateDoc(friendDocRef, {
      friends: arrayUnion(userData.id),
    });

    console.log("Friend request accepted!");
  } catch (error) {
    console.error("Error accepting friend request:", error);
    showModal("Error accepting friend request");
  }
};

// Attach the function to the "freindRequests" button in your navbar
freindRequests.addEventListener("click", () => {
  showFriendRequests();
});

async function showFriendsModal(friendsList) {
  showLoadingSpinner();
  let modalContent = "<h3>Your Friends</h3><div id='friendsList'></div>";

  try {
    // Convert friend IDs into Firestore document references
    const friendRefs = friendsList.map((friendId) =>
      doc(db, "Users", friendId)
    );

    // Fetch all friends in parallel
    const friendSnapshots = await Promise.all(
      friendRefs.map((friendRef) => getDoc(friendRef))
    );

    showModal(modalContent);

    // Get the friends list container
    const friendsListContainer = document.getElementById("friendsList");

    // Process and display each friend
    friendSnapshots.forEach((friendSnap, index) => {
      if (friendSnap.exists()) {
        const friendName = friendSnap.data().firstName || "Unknown User";
        const friendId = friendsList[index];

        // Create button div
        const div = document.createElement("div");
        div.className = "showFreindsModalInnerDiv";

        // Create button element
        const button = document.createElement("button");
        button.textContent = `Chat 💬`;

        // Create button element
        const h3 = document.createElement("h3");
        h3.textContent = ` ${friendName}`;

        // Attach event listener correctly
        button.addEventListener("click", () => openChat(friendId, friendName));

        // Append button to the modal
        div.appendChild(h3);
        div.appendChild(button);
        friendsListContainer.appendChild(div);
        friendsListContainer.appendChild(document.createElement("br"));
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    hideLoadingSpinner();
  }
}

async function openChat(friendId, friendName) {
  closeModal();
  const chatId = generateChatId(userData.id, friendId);

  // Set the offcanvas header to show friend's name
  document.getElementById(
    "chatOffcanvasLabel"
  ).innerText = `Chat with ${friendName}`;

  // Clear any previous messages from the offcanvas body
  document.getElementById("chatOffcanvasBody").innerHTML = "";

  // Show the offcanvas panel using Bootstrap's Offcanvas API
  const offcanvasEl = document.getElementById("chatOffcanvas");
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
  bsOffcanvas.show();

  // Start listening for new messages; messages will be loaded into the offcanvas body
  listenForMessages(chatId, friendName, "chatOffcanvasBody");

  // Attach event listener to the Send button in the offcanvas
  const sendBtn = document.getElementById("offcanvasSendMessageBtn");
  sendBtn.onclick = function () {
    sendMessage(chatId, friendId, "offcanvasMessageInput");
  };
}

function generateChatId(userId1, userId2) {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

async function listenForMessages(
  chatId,
  friendName,
  containerId = "chatMessages"
) {
  const chatRef = collection(db, "chats", chatId, "messages");
  const queryRef = query(chatRef, orderBy("timestamp", "asc")); // Order messages from oldest to newest

  onSnapshot(queryRef, (snapshot) => {
    let messagesHtml = "";
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageTime = message.timestamp
        ? new Date(message.timestamp.toMillis()).toLocaleString()
        : "Just now";
      messagesHtml += `<p><small>${messageTime}</small><br>
        <strong>${
          message.senderId === userData.id ? "YOU" : friendName
        }:</strong> ${message.text}</p>`;
    });
    const container = document.getElementById(containerId);
    container.innerHTML = messagesHtml;
    container.scrollTop = container.scrollHeight;
  });
}

async function sendMessage(chatId, receiverId, inputFieldId = "messageInput") {
  const messageInput = document.getElementById(inputFieldId);
  if (!messageInput.value.trim()) return;

  const chatRef = collection(db, "chats", chatId, "messages");
  await addDoc(chatRef, {
    senderId: userData.id,
    receiverId,
    text: messageInput.value.trim(),
    timestamp: serverTimestamp(),
  });

  messageInput.value = "";
}

// Attach the displayFriendsPosts function to the "chatWithFriends" button in your navbar

chatWithFriends.addEventListener("click", async () => {
  console.log(userData.id);

  // const userId = auth.currentUser?.uid;
  // if (!userId) return showModal("Please log in first!");

  // Fetch user's friends from Firestore
  const userRef = doc(db, "Users", userData.id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || !userSnap.data().friends?.length) {
    return showModal("You have no friends 😢");
  }

  const friendsList = userSnap.data().friends;
  console.log(friendsList);
  showFriendsModal(friendsList);
});

document.addEventListener("DOMContentLoaded", () => {
  const background = document.getElementById("background");

  let createBox = () => {
    const box = document.createElement("div");
    box.classList.add("box");

    let size = Math.random() * 10 + 10; // Random size between 10px and 20px

    let posX = Math.random() * window.innerWidth;
    let posY = Math.random() * window.innerHeight;
    let duration = Math.random() * 4 + 3; // 3s to 7s animation duration

    box.style.width = `${size}px`;
    box.style.height = `${size}px`;
    box.style.left = `${posX}px`;
    box.style.top = `${posY}px`;
    box.style.animationDuration = `${duration}s`;

    background.appendChild(box);

    setTimeout(() => {
      box.remove();
    }, duration * 1000);
  };

  setInterval(createBox, 300);
});

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.querySelector(".navbarMain ul");
  const hamburger = document.querySelector(".menu-icon");

  // When hamburger is clicked, if menu is open, add a one-time listener on the document
  hamburger.addEventListener("click", function () {
    // Use a short timeout so that the checkbox state updates first
    setTimeout(() => {
      if (menuToggle.checked) {
        // Attach a one-time event listener to close the menu on outside click
        document.addEventListener("click", function handler(event) {
          // If click is outside the menu and hamburger, close the menu
          if (!menu.contains(event.target) && event.target !== hamburger) {
            menuToggle.checked = false;
            document.removeEventListener("click", handler);
          }
        });
      }
    }, 0);
  });
});

allPostsDiv.style.display = "flex";
getAllPosts();

// here are GSAP area for css

let tl = gsap.timeline();
// navbar buttons css
gsap.from(".ulForNavbar li", {
  y: -30,
  opacity: 0,
  duration: 0.5,
  delay: 0.5,
  stagger: 0.3,
});
// check  my github div here
gsap.from(".myGithubDiv", {
  height: "1%",
  opacity: 0,
  duration: 1,
  delay: 1,
  ease: "bounce.out",
});
// check  my postfoloi div here
gsap.from(".myPortfolioDiv", {
  height: "1%",
  opacity: 0,
  duration: 1,
  delay: 1,
  ease: "bounce.out",
});
// now css for the main post div here lesgoo
gsap.from(".myPortfolioDiv img, .myGithubDiv img", {
  y: -220,
  opacity: 0,
  duration: 1.8,
  delay: 1.1,
});
// --------------------------------------
