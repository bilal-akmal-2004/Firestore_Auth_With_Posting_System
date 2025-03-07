import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
  addDoc,
  collection,
  getFirestore,
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
  document.getElementById("modalMessage").innerHTML = message;
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
let freindRequests = document.getElementById("freindRequests");
let chatWithFriends = document.getElementById("chatWithFriends");

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
const displayPosts = () => {
  allPostsDiv.innerHTML = `<h1 style="color: skyblue; font-size: 65px; text-decoration: underline; text-transform: uppercase;">All Posts</h1>`;

  savedPosts.forEach((post, index) => {
    allPostsDiv.insertAdjacentHTML(
      "beforeend",
      `<div style="display: flex; justify-content: center;">
        <div class="postDiv">
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
          <h1>${index + 1}: ${post.postHeading}</h1>
          <h3>${post.postText}</h3>
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

  document.querySelectorAll(".addFreind").forEach((button) => {
    button.addEventListener("click", function () {
      // Get the recipient's UID from the data attribute
      const recipientUID = this.dataset.userid;
      sendFriendRequest(recipientUID);
    });
  });

  // ✅ Attach event listeners correctly
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

const openLikedByModal = (postUID) => {
  const post = savedPosts.find((p) => p.postUID === postUID);

  if (!post || post.likedBy.length === 0) {
    showModal("No likes yet!");
    return;
  }

  // 🔄 Create a fresh user lookup map each time (to stay updated)
  const userMap = {};
  savedPosts.forEach((p) => {
    userMap[p.id] = p.name; // Map user UID to name
  });

  // Find names of users who liked the post
  const likedUserNames = post.likedBy
    .map((userUID) => userMap[userUID] || "Unknown User")
    .filter((name) => name !== "Unknown User");

  // Create modal dynamically
  let modal = document.createElement("dialog");
  modal.setAttribute("id", "likedByModal");
  modal.innerHTML = `
    <div style="text-align: center; padding: 20px; border-radius: 10px; background: white; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
      <h2>Liked By:</h2>
      <ul>${
        likedUserNames.map((name) => `<li>${name}</li>`).join("") ||
        "<li>No users found</li>"
      }</ul>
      <button class="btn btn-primary" id="closeLikedByModal">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Show the modal
  modal.showModal();

  // Close button functionality
  document.getElementById("closeLikedByModal").addEventListener("click", () => {
    modal.close();
    modal.remove();
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

// Function to show friend requests in a modal
const showFriendRequests = async () => {
  try {
    showLoadingSpinner();
    // Get current user's document from the "Users" collection (ensure collection name matches your structure)
    const userDocRef = doc(db, "Users", userData.id);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const friendRequests = data.friendRequests || [];

      if (friendRequests.length === 0) {
        showModal("No requests available");
      } else {
        // For each UID in friendRequests, fetch the user's name
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

        // Build HTML list with an Accept button for each friend request
        let requestsHtml = "<ul>";
        friendRequestsInfo.forEach((info) => {
          requestsHtml += `<li>
            ${info.name} 
            <button class="accept-btn btn btn-success" data-uid="${info.uid}">Accept</button>
          </li>`;
        });
        requestsHtml += "</ul>";

        // Create and show the modal dynamically
        let modal = document.createElement("dialog");
        modal.setAttribute("id", "friendRequestsModal");
        modal.innerHTML = `
          <div style="padding:20px; border-radius:10px; background:white; box-shadow: 0px 4px 6px rgba(0,0,0,0.1); text-align:center;">
            <h2>Friend Requests</h2>
            ${requestsHtml}
            <button id="closeFriendRequestsModal" class="btn btn-primary">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        modal.showModal();

        // Attach event listeners for Accept buttons
        document.querySelectorAll(".accept-btn").forEach((button) => {
          button.addEventListener("click", async function () {
            const friendUID = this.dataset.uid;
            await acceptFriendRequest(friendUID);
            // Optionally, remove this request from the modal UI
            this.parentElement.remove();
          });
        });

        // Attach event listener for closing the modal
        document
          .getElementById("closeFriendRequestsModal")
          .addEventListener("click", () => {
            modal.close();
            modal.remove();
          });
      }
    } else {
      showModal("User document not found");
    }
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    showModal("Error fetching friend requests");
  } finally {
    hideLoadingSpinner();
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
  myPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "flex";
  showFriendRequests();
});

// // Function to display only friends' posts
// const displayFriendsPosts = async () => {
//   try {
//     console.log("displayFriendsPosts: Starting function.");
//     showLoadingSpinner();

//     // 1. Get the current user's document from the "Users" collection.
//     // (Change "Users" to "users" if needed.)
//     const currentUserDocRef = doc(db, "Users", userData.id);
//     const currentUserDocSnap = await getDoc(currentUserDocRef);

//     if (!currentUserDocSnap.exists()) {
//       console.error("Current user document not found.");
//       showModal("User document not found.");
//       return;
//     }

//     const currentUserData = currentUserDocSnap.data();
//     const friendsArray = currentUserData.friends || [];
//     console.log("displayFriendsPosts: Friends array:", friendsArray);

//     if (friendsArray.length === 0) {
//       showModal("You have no friends added.");
//       return;
//     }

//     // 2. Query posts where the "id" field (owner's UID) is in the friends array.
//     // Note: The "in" operator accepts up to 10 values. If your friends list is longer, you'll need to batch queries.
//     const friendsPostsQuery = query(
//       collection(db, "posts"),
//       where("id", "in", friendsArray)
//     );
//     console.log("displayFriendsPosts: Running query with friendsArray.");

//     const querySnapshot = await getDocs(friendsPostsQuery);
//     console.log(
//       "displayFriendsPosts: Query snapshot size:",
//       querySnapshot.size
//     );

//     const friendsPosts = querySnapshot.docs.map((doc) => ({
//       postUID: doc.id,
//       ...doc.data(),
//     }));
//     console.log("displayFriendsPosts: Friends posts fetched:", friendsPosts);

//     // 3. Display these posts using a dedicated UI function.
//     displayFriendsPostsUI(friendsPosts);
//   } catch (error) {
//     console.error("Error fetching friend's posts:", error);
//     showModal("Error fetching friend's posts.");
//   } finally {
//     console.log("displayFriendsPosts: Hiding spinner.");
//     hideLoadingSpinner();
//   }
// };

// FIRENDS FOR THATA CAHTTING SYSTME
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

        // Create button element
        const button = document.createElement("button");
        button.textContent = `Chat with ${friendName}`;
        button.style.borderRadius = "20px";

        // Attach event listener correctly
        button.addEventListener("click", () => openChat(friendId, friendName));

        // Append button to the modal
        friendsListContainer.appendChild(button);
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
  const chatId = generateChatId(userData.id, friendId);

  // Create modal content
  showModal(`<h3>Chat with ${friendName}</h3>
      <div id="chatMessages"></div>
      <input type="text" id="messageInput" placeholder="Type a message..." />
      <button id="sendMessageBtn">Send</button>
  `);

  // Start listening for new messages
  listenForMessages(chatId, friendName);

  // Attach event listener to the send button after the modal is shown
  document.getElementById("sendMessageBtn").addEventListener("click", () => {
    sendMessage(chatId, friendId);
  });
}

function generateChatId(userId1, userId2) {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

async function listenForMessages(chatId, friendName) {
  const chatRef = collection(db, "chats", chatId, "messages");
  onSnapshot(chatRef, (snapshot) => {
    let messagesHtml = "";
    snapshot.forEach((doc) => {
      const message = doc.data();
      messagesHtml += `<p><strong>${
        message.senderId === userData.id ? "YOU" : friendName
      }:</strong> ${message.text}</p>`;
    });
    document.getElementById("chatMessages").innerHTML = messagesHtml;
  });
}

async function sendMessage(chatId, receiverId) {
  const messageInput = document.getElementById("messageInput");
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
  myPostsDiv.style.display = "none";
  mainFormCreateUser.style.display = "none";
  allPostsDiv.style.display = "flex";

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
