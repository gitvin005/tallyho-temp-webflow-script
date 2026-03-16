// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app-check.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-functions.js";
import {
  getAnalytics,
  logEvent,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

// Firestore imports
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  increment,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Storage imports
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

import {
  getAuth,
  signInWithCustomToken,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCl9PDBCmbz9f_oYRT1v8jVsF06Y7Er_is",
  authDomain: "tallyhotemps.firebaseapp.com",
  projectId: "tallyhotemps",
  storageBucket: "tallyhotemps.firebasestorage.app",
  messagingSenderId: "1084350726035",
  storageBucket: "tallyhotemps.firebasestorage.app",
  appId: "1:1084350726035:web:8d0e47398231fc5a5d3266",
  measurementId: "G-2TXHW7ZH28",
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LeBq1crAAAAAC65ElQyEb-nHRWn53XkwNk1z4Ts"),
  isTokenAutoRefreshEnabled: true, // ensures token is auto-refreshed
});

// ✅ Now it's safe to initialize other services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

document.addEventListener("DOMContentLoaded", function () {
  const locationDropdown = document.getElementById("uk-location");

  if (
    locationDropdown &&
    (locationDropdown.tagName === "SELECT" ||
      (locationDropdown.tagName === "INPUT" &&
        locationDropdown.type === "text"))
  ) {
    const choices = new Choices(locationDropdown, {
      searchEnabled: true,
      itemSelectText: "",
      placeholderValue: "Select a location",
    });

    locationDropdown.addEventListener("change", function () {
      const event = new Event("input", { bubbles: true });
      locationDropdown.dispatchEvent(event);
    });
  } else {
    console.warn("#uk-location is not a valid select or text input element.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const locationDropdown = document.getElementById("uk-location-list");

  if (!locationDropdown || locationDropdown.tagName !== "SELECT") {
    return;
  }

  const choices = new Choices(locationDropdown, {
    searchEnabled: true,
    itemSelectText: "",
    placeholderValue: "Select a location",
  });

  function syncSelectedOption() {
    const selectedValue = locationDropdown.value;
    if (selectedValue) {
      choices.setChoiceByValue(selectedValue);
    }
  }

  document.addEventListener("MSMember", function () {
    setTimeout(syncSelectedOption, 100);
  });

  setTimeout(syncSelectedOption, 500);

  // Update Memberstack on location change
  locationDropdown.addEventListener("change", function () {
    const selectedVal = locationDropdown.value;
    if (window.MemberStack && MemberStack.onReady) {
      MemberStack.onReady.then(function (member) {
        member.updateProfile({
          location: selectedVal,
        });
      });
    }
  });
});

document.querySelectorAll("#Offerjob").forEach((button) => {
  button.addEventListener("click", () => {
    const userId = button.dataset.id;
    const userName = button.dataset.name;
    const rate = button.dataset.hour;

    // Redirect with query parameters
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/book-now?userId=${encodeURIComponent(
      userId,
    )}&name=${encodeURIComponent(userName)}&rate=${encodeURIComponent(rate)}`;
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");
  const userName = urlParams.get("name");
  const rate = urlParams.get("rate");

  if (userName) document.getElementById("Freelancer").value = userName;
  if (rate) document.getElementById("Per-Hour").value = rate;
});

function calculatePrice() {
  const hours = parseFloat(document.getElementById("Hour").value);
  const rate = parseFloat(document.getElementById("Per-Hour").value);

  if (!isNaN(hours) && !isNaN(rate)) {
    const amount = hours * rate;
    const serviceCharge = amount * 0.05;
    const total = amount + serviceCharge;

    document.getElementById("amount").textContent = amount.toFixed(2);
    document.getElementById("serviceCharge").textContent =
      serviceCharge.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
  }
}

const hourInput = document.getElementById("Hour");
const rateInput = document.getElementById("Per-Hour");

if (hourInput && rateInput) {
  hourInput.addEventListener("input", calculatePrice);
  rateInput.addEventListener("input", calculatePrice);
  calculatePrice(); // Initial calculation
}

document.addEventListener("DOMContentLoaded", function () {
  // Wait for Memberstack to load
  window.$memberstackDom &&
    window.$memberstackDom.getCurrentMember().then(({ data }) => {
      if (data) {
        // ✅ Store User Data
        window.memberstackUserId = data.id;
        window.memberstackUserName = data.customFields["first-name"];
      }
    });
});

async function getMemberData() {
  const memberstack = window.$memberstackDom;
  const member = await memberstack.getCurrentMember();
  return member || null;
}

async function getLoginId() {
  const memberstack = window.$memberstackDom;
  const member = await memberstack.getCurrentMember();
  return member?.data?.id || null;
}
async function getEmailId() {
  const memberstack = window.$memberstackDom;
  const member = await memberstack.getCurrentMember();
  return member?.data?.auth?.email || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const memberstack = window.$memberstackDom;
  const memberData = await memberstack.getCurrentMember();
  const member = memberData.data;

  const currentPath = window.location.pathname;
  const EMAIL_VERIFY_PATH = "/authentication/email-verify";
  const DASHBOARD_PATH = "/freelancer-pages/dashboard";
  const VALID_PLAN_ID = "pln_freelancer-jw4104qh";

  const customFields = member.customFields || {};
  const profileImage = member.profileImage;
  const planConnections = member.planConnections || [];

  if (!member.verified && currentPath !== EMAIL_VERIFY_PATH) {
    return (window.location.href = EMAIL_VERIFY_PATH);
  }

  const hasValidPlan = planConnections.some(
    (plan) => plan.planId === VALID_PLAN_ID && plan.status === "ACTIVE",
  );

  if (!hasValidPlan) {
    return; // 🛑 Do nothing if plan is not valid
  }

  const steps = [
    { field: "usage", path: "/onboarding/one", optional: false },
    { field: "goal", path: "/onboarding/two", optional: false },
    { field: "experience-title", path: "/onboarding/three", optional: false },
    { field: "profileImage", path: "/onboarding/four", optional: false },
    { field: "bio", path: "/onboarding/five", optional: true },
    { field: "location", path: "/onboarding/five", optional: false },
    { field: "skills", path: "/onboarding/five", optional: false },
    { field: "hour-rate", path: "/onboarding/five", optional: false },
  ];

  function isFieldFilled(field, value) {
    if (field === "profileImage") {
      return typeof profileImage === "string" && profileImage.trim() !== "";
    }
    return typeof value === "string" ? value.trim() !== "" : !!value;
  }

  function getFieldValue(field) {
    return field === "profileImage" ? profileImage : customFields[field];
  }

  const firstIncomplete = steps.find(
    ({ field, optional }) =>
      !optional && !isFieldFilled(field, getFieldValue(field)),
  );

  const allRequiredFilled = steps.every(
    ({ field, optional }) =>
      optional || isFieldFilled(field, getFieldValue(field)),
  );

  if (allRequiredFilled && currentPath.startsWith("/onboarding/")) {
    return (window.location.href = DASHBOARD_PATH);
  }

  if (currentPath === DASHBOARD_PATH && firstIncomplete) {
    return (window.location.href = firstIncomplete.path);
  }

  const currentStepIndex = steps.findIndex((step) => step.path === currentPath);

  if (currentStepIndex !== -1) {
    const previousIncomplete = steps
      .slice(0, currentStepIndex)
      .find(
        ({ field, optional }) =>
          !optional && !isFieldFilled(field, getFieldValue(field)),
      );

    if (previousIncomplete) {
      return (window.location.href = previousIncomplete.path);
    }

    return; // ✅ Allow current step
  }

  if (
    firstIncomplete &&
    currentStepIndex === -1 &&
    currentPath !== firstIncomplete.path &&
    currentPath !== EMAIL_VERIFY_PATH
  ) {
    return (window.location.href = firstIncomplete.path);
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const userId = await getLoginId();
  const currentPath = window.location.pathname;

  // List of pages where logged-in users shouldn't go
  const blockedPaths = ["/authentication/sign-up", "/authentication/login"];

  if (userId && blockedPaths.includes(currentPath)) {
    window.location.href = "/"; // Change to "/dashboard" if needed
  }
});

document
  .getElementById("stripeAccount")
  ?.addEventListener("click", async () => {
    try {
      const memberstack = window.$memberstackDom;
      if (!memberstack) {
        alert("Memberstack not loaded.");
        return;
      }

      const { data: memberData } = (await memberstack.getCurrentMember()) || {};
      if (!memberData) {
        alert("User not logged in.");
        return;
      }

      const memberstackId = memberData.id || "";
      const name = memberData.customFields?.["first-name"] || "Guest";
      const email = memberData.auth?.email || "";

      if (!email || !memberstackId) {
        alert("Missing user information.");
        return;
      }

      const response = await fetch(
        "https://us-central1-tallyhotemps.cloudfunctions.net/createStripeExpressAccount",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberstackId, name, email }),
        },
      );

      const result = await response.json();

      // Handle response
      if (response.ok && result?.url) {
        window.location.href = result.url;
      } else {
        alert(result?.error || "Something went wrong.");
      }
    } catch (error) {
      alert("Error creating Stripe account.");
    }
  });

async function markTransferPendingRequest(jobId) {
  try {
    const jobSnap = await getDoc(doc(db, "jobOffers", jobId));
    if (!jobSnap.exists()) {
      throw new Error("Job offer not found");
    }

    const jobData = jobSnap.data();
    const sessionId = jobData?.sessionId;
    if (!sessionId) {
      throw new Error("sessionId ID not found in job offer");
    }

    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("transactionId", "==", sessionId));
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      throw new Error("Transaction not found for sessionId: " + sessionId);
    }

    const transactionId = querySnap.docs[0].id;

    const response = await fetch(
      "https://us-central1-tallyhotemps.cloudfunctions.net/markTransferPending",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobOfferId: jobId,
          sessionId: sessionId,
          transactionId: transactionId,
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "Transfer scheduled.",
      };
    } else {
      return { success: false, message: result.error || "Unknown error" };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

document.querySelectorAll(".contact-btn").forEach((button) => {
  button.addEventListener("click", async function () {
    const receiverId = this.dataset.userId;

    const userDoc = await getDoc(doc(db, "users", receiverId));
    if (!userDoc.exists()) {
      alert("User not found.");
      return;
    }

    const userData = userDoc.data();
    const fullName = `${userData.name}`.trim();
    const userSlug = encodeURIComponent(
      window.formatChatName(fullName).toLowerCase().replace(/\s+/g, "-"),
    );

    sessionStorage.setItem(`nameToId:${userSlug}`, receiverId);

    window.sessionId = sessionStorage.getItem(`nameToId:${userSlug}`);

    window.location.href = `/conversation?user=${userSlug}`;
  });
});

// Full JavaScript Chat System Code for Webflow (Memberstack + Firebase)
(async () => {
  const memberstack = window.$memberstackDom;
  const memberData = await memberstack.getCurrentMember();
  const senderId = memberData.data.id;
  const senderName = window.formatChatName(
    memberData.data.customFields["first-name"] +
    " " +
    memberData.data.customFields["last-name"]
  )
    
  const senderImage =
    memberData.data.profileImage?.trim() || "/default-avatar.png";

  const messagesContainer = document.getElementById("messagesList");
  const requestCountBadge = document.getElementById("requestCount");
  const requestListContainer = document.getElementById("requestList");
  const chatListContainer = document.getElementById("chatList");
  const inputEl = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileUpload");
  const sendButton = document.getElementById("sendMessageBtn");
  const previewContainer = document.getElementById("filePreview");
  const dropdown = document.getElementById("chat-sort-dropdown");
  const messagewrapper = document.querySelector(".messagewrapper");

  let lastTimestamp = 0;
  let uploadedFile = null;
  let uploadedFileURL = null;
  let isUploading = false;

  const userSlug = new URLSearchParams(window.location.search).get("user");
  let receiverId = sessionStorage.getItem(`nameToId:${userSlug}`);
  let conversationId = receiverId
    ? [senderId, receiverId].sort().join("_")
    : null;

  await setDoc(
    doc(db, "users", senderId),
    {
      name: senderName,
      profileImage: senderImage,
      status: "active",
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  const previewFile = (file) => {
    const fileUrl = URL.createObjectURL(file);

    previewContainer.innerHTML = `
    <div class="file-preview-wrapper" style="position: relative; display: inline-block;">
      ${
        file.type.startsWith("image/")
          ? `<img src="${fileUrl}" class="file-preview-image" />`
          : `<p class="file-preview-name">${file.name}</p>`
      }
      <button class="remove-preview" style="
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4d4f;
        border: none;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 16px;
        cursor: pointer;
      ">&times;</button>
    </div>
  `;

    // Add event listener to remove button
    const removeBtn = previewContainer.querySelector(".remove-preview");
    removeBtn.addEventListener("click", () => {
      previewContainer.innerHTML = "";
      fileInput.value = ""; // ✅ THIS clears the file from the input too
      uploadedFile = null;
      uploadedFileURL = null;
    });
  };

  const uploadFile = async (file) => {
    const storageRef = ref(
      storage,
      `images/conversations/${conversationId}/${Date.now()}_${file.name}`,
    );
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const appendMessage = (data, senderId) => {
    const timestamp = data.timestamp?.toDate();

    if (lastTimestamp && timestamp && timestamp - lastTimestamp > 86400000) {
      const separator = document.createElement("div");
      separator.classList.add("day-separator");
      separator.textContent = timestamp.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      messagesContainer.appendChild(separator);
    }
    lastTimestamp = timestamp;

    const msg = document.createElement("div");
    msg.classList.add(
      "message",
      data.senderId === senderId ? "sender" : "receiver",
    );

    let fileHTML = "";
    let messageHTML = "";

    // If there's a file
    if (data.fileUrl) {
      const isImage = data.fileUrl;
      fileHTML = isImage
        ? `<img src="${data.fileUrl}" class="chat-img" data-lightbox />`
        : `<a href="${data.fileUrl}" target="_blank">${
            data.fileName || "View File"
          }</a>`;
    }

    // If there's a message
    if (data.message?.trim()) {
      messageHTML = `<p class="chat-message">${data.message}</p>`;
    }

    // Combine them
    let contentHTML = `${fileHTML}${messageHTML}`;

    msg.innerHTML = `
        <div class="message-header">
  			<img src="${data.profileImage || senderImage}" class="msg-profile-pic" />
        <div>
  			<strong>${window.formatChatName(data.name)}</strong>
          <span class="time">${
            timestamp?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) || "Now"
          }</span>
  		</div>
  		</div>
        <div>
          ${contentHTML}
          ${
            data.pending && data.senderId === senderId
              ? `<div class="pending-msg">Waiting for recipient to accept your request.</div>`
              : ""
          }
        </div>
        `;

    messagesContainer.appendChild(msg);
  };

  fileInput?.addEventListener("change", async function () {
    uploadedFile = this.files[0];
    if (!uploadedFile) return;

    previewFile(uploadedFile);

    isUploading = true;
    try {
      uploadedFileURL = await uploadFile(uploadedFile);
    } catch (err) {
      alert("Upload failed, please try again.");
      uploadedFile = null;
      uploadedFileURL = null;
      previewContainer.innerHTML = "";
    }
    isUploading = false;
  });

  // Function to send a message
  const sendMessage = async () => {
    if (!receiverId || !conversationId) {
  alert("No user selected");
  return;
}

    if (senderId === receiverId) {
      alert("You cannot send a message to yourself.");
      return;
    }
    const rawMessage = inputEl.value;
    const message = rawMessage.trim();

    if (isUploading) {
      alert("Please wait, file is still uploading...");
      return;
    }

    if (!message && !uploadedFileURL) return;

    const chatSnap = await getDoc(
      doc(db, "users", receiverId, "chats", senderId),
    );
    const isNew = !chatSnap.exists();

    if (isNew) {
      await setDoc(doc(db, "users", receiverId, "requests", senderId), {
        userId: senderId,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "users", receiverId, "notifications"), {
        title: "New Request",
        message: `${senderName} has sent you a request.`,
        senderId,
        senderName,
        senderImage,
        timestamp: serverTimestamp(),
        read: false,
      });
    }

    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId,
      receiverId,
      message,
      name: senderName,
      profileImage: senderImage,
      timestamp: serverTimestamp(),
      fileUrl: uploadedFileURL || "",
      fileName: uploadedFile?.name || "",
      pending: isNew,
      read: false,
    });

    await Promise.all([
      setDoc(doc(db, "users", senderId, "chats", receiverId), {
        conversationId,
        userId: receiverId,
        timestamp: serverTimestamp(),
      }),
      setDoc(doc(db, "users", receiverId, "chats", senderId), {
        conversationId,
        userId: senderId,
        timestamp: serverTimestamp(),
      }),
    ]);

    inputEl.value = "";
    uploadedFile = null;
    uploadedFileURL = null;
    previewContainer.innerHTML = "";
  };

  sendButton?.addEventListener("click", sendMessage);

  if (receiverId) {
    const chatSnap = await getDoc(
      doc(db, "users", senderId, "chats", receiverId),
    );
    if (chatSnap.exists()) {
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc"),
      );

      onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = "";
        snapshot.forEach((doc) => appendMessage(doc.data(), senderId));

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        snapshot.docs.forEach(async (doc) => {
          if (doc.data().receiverId === senderId && !doc.data().read) {
            await updateDoc(doc.ref, { read: true });
          }
        });
      });
    } else {
      messagesContainer.innerHTML =
        "<p style='text-align:center;'>Send a message to start the conversation</p>";
    }
  }

  if (!chatListContainer || !dropdown || !senderId) {
    return;
  }

  let unsubscribe = null;
  chatListContainer.innerHTML = "<p>Loading...</p>";

  let activeConversationUnsub = null;
  let activeReceiverId = null;

  function updateBookFreelancer(userId) {

  const bookBtn = document.querySelector(".bookbutton");

  if (!bookBtn) return;

  bookBtn.innerHTML = `
    <a href="#" data-ms-content="clients" id="bookFreelancer" class="button is-small" data-id="${userId}">
      Book Freelancer
    </a>
  `;

  const freelancerBtn = document.getElementById("bookFreelancer");

  freelancerBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const userId = this.dataset.id;

    fetch(`https://api-ten-gamma-86.vercel.app/api/proxy-freelancer?id=${userId}`)
      .then((res) => res.json())
      .then((data) => {

        const freelancer = data?.fieldData;

        if (freelancer && freelancer["user-id"]) {

          const name = freelancer["full-name"] || "Unknown";
          const rate = freelancer.rate || "0";
          const id = freelancer["user-id"];

          const baseUrl = window.location.origin;

          window.location.href =
            `${baseUrl}/book-now?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&rate=${encodeURIComponent(rate)}`;

        } else {
          alert("Freelancer not valid or data not found.");
        }

      })
      .catch((err) => {
        console.error(err);
        alert("Error fetching freelancer data.");
      });

  });

}

  async function openChat(userId) {
    receiverId = userId;
    activeReceiverId = userId;

     conversationId = [senderId, userId].sort().join("_");

     updateBookFreelancer(userId);

    if (activeConversationUnsub) {
      activeConversationUnsub(); // stop previous listener
    }

    messagesContainer.innerHTML = "<p>Loading...</p>";

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc"),
    );

    activeConversationUnsub = onSnapshot(q, async  (snapshot) => {
      messagesContainer.innerHTML = "";

      snapshot.forEach((docSnap) => {
        appendMessage(docSnap.data(), senderId);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // ✅ MARK MESSAGES AS READ
      const unreadQuery = query(
        collection(db, "conversations", conversationId, "messages"),
        where("receiverId", "==", senderId),
        where("read", "==", false)
      );

      const unreadSnap = await getDocs(unreadQuery);

      unreadSnap.forEach(async (docSnap) => {
        await updateDoc(docSnap.ref, { read: true });
      });

    });
  }


  const loadChats = (sortType = "recent") => {
    if (unsubscribe) unsubscribe();

    let chatRef = collection(db, "users", senderId, "chats");
    let chatQuery;

    if (sortType === "newest") {
      chatQuery = query(chatRef, orderBy("timestamp", "desc"));
    } else if (sortType === "oldest") {
      chatQuery = query(chatRef, orderBy("timestamp", "asc"));
    } else {
      chatQuery = query(chatRef, orderBy("timestamp", "desc")); // default
    }

    unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      // 🔥 Auto open first chat BEFORE rendering UI
      if (!receiverId && !snapshot.empty && !activeReceiverId) {
  for (const chatDoc of snapshot.docs) {

    const chatData = chatDoc.data();
    const firstUserId = chatData.userId;

    if (!firstUserId) continue;

    const requestRef = doc(db, "users", senderId, "requests", firstUserId);
    const requestSnap = await getDoc(requestRef);

    // skip pending users
    if (requestSnap.exists()) continue;

    activeReceiverId = firstUserId;
    openChat(firstUserId);

    const firstUserDoc = await getDoc(doc(db, "users", firstUserId));

    if (firstUserDoc.exists()) {
      const name = window.formatChatName(firstUserDoc.data().name);
      const slug = encodeURIComponent(
        name.toLowerCase().trim().replace(/\s+/g, "-")
      );

      history.replaceState(null, "", `/conversation?user=${slug}`);
    }

    break; // ✅ stop after first valid chat

  }
}

      const frag = document.createDocumentFragment();
      const renderedUserIds = new Set();

      // Only show "No chats found" message temporarily
      if (snapshot.empty) {
        chatListContainer.innerHTML = "<p>No chats found.</p>";
      }
      const userFetches = snapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data();
        let userId = chatData.userId;
        if (!userId) return;

        const requestRef = doc(db, "users", senderId, "requests", userId);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists()) return;

        renderedUserIds.add(userId);

        const userDoc = await getDoc(doc(db, "users", userId));
        const userExists = userDoc.exists();
        const name = userExists
          ? window.formatChatName(userDoc.data().name)
          : "Deleted User";
        const image =
          userDoc.data()?.profileImage?.trim() || "/default-avatar.png";

        const userSlug = encodeURIComponent(
          name.toLowerCase().trim().replace(/\s+/g, "-"),
        );
        const slugKey = `nameToId:${userSlug}`;
        if (!sessionStorage.getItem(slugKey) && userExists) {
          sessionStorage.setItem(slugKey, userId);
        }

        const unreadSnap = await getDocs(
          query(
            collection(
              db,
              "conversations",
              chatData.conversationId,
              "messages",
            ),
            where("receiverId", "==", senderId),
            where("read", "==", false),
          ),
        );

        const isActive = userId === receiverId;
        const wrapper = document.createElement("div");
        wrapper.className = `chat-item-wrapper ${isActive ? "active-chat" : ""}`;
        wrapper.innerHTML = `
    <a href="#" class="chat-item" data-user="${userId}" data-slug="${userSlug}">
      <img src="${image}" class="profile-pic" />
      <span>${name}</span>
      ${unreadSnap.size > 0 ? `<span class="msg-count-badge">${unreadSnap.size}</span>` : ""}
    </a>`;

        frag.appendChild(wrapper);

        if (isActive) {
          const bookBtn = document.querySelector(".bookbutton");

          bookBtn.innerHTML = `
    <a href="#" data-ms-content="clients" id="bookFreelancer" class="button is-small" data-id="${userId}">
      Book Freelancer
    </a>
  `;

          messagewrapper.appendChild(bookBtn);

          const freelancerBtn = document.getElementById("bookFreelancer");

          if (freelancerBtn) {
            freelancerBtn.addEventListener("click", function (e) {
              e.preventDefault();

              const userId = freelancerBtn.getAttribute("data-id");

              fetch(
                `https://api-ten-gamma-86.vercel.app/api/proxy-freelancer?id=${userId}`,
              )
                .then((res) => res.json())
                .then((data) => {
                  const freelancer = data?.fieldData;

                  if (freelancer && freelancer["user-id"]) {
                    const name = freelancer["full-name"] || "Unknown";
                    const rate = freelancer.rate || "0";
                    const id = freelancer["user-id"];

                    const baseUrl = window.location.origin;

                    // Redirect with query params
                    window.location.href = `${baseUrl}/book-now?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&rate=${encodeURIComponent(rate)}`;
                  } else {
                    alert("Freelancer not valid or data not found.");
                  }
                })
                .catch((err) => {
                  console.error(err);
                  alert("An error occurred while fetching freelancer data.");
                });
            });
          }
        }
      });

      await Promise.all(userFetches);

      // clear container only once
      chatListContainer.innerHTML = "";
      chatListContainer.appendChild(frag);

      chatListContainer.querySelectorAll(".chat-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();

          const userId = item.dataset.user;
          const slug = item.dataset.slug;

          openChat(userId);
          updateBookFreelancer(userId); 

          history.pushState(null, "", `/conversation?user=${slug}`);

          document
            .querySelectorAll(".chat-item-wrapper")
            .forEach((el) => el.classList.remove("active-chat"));

          item.parentElement.classList.add("active-chat");

          // ✅ REMOVE BADGE WHEN CHAT OPENS
          const badge = item.querySelector(".msg-count-badge");
          if (badge) badge.remove();

        });
      });

      // 🔥 FIX: show receiver if not already rendered
      if (!renderedUserIds.has(receiverId)) {
        try {
          const newUserDoc = await getDoc(doc(db, "users", receiverId));
          if (newUserDoc.exists()) {
            const newUserData = newUserDoc.data();
            const newName =
              window.formatChatName(newUserData.name) || "Unknown";
            const newImage =
              newUserData.profileImage?.trim() || "/default-avatar.png";
            const newUserSlug = encodeURIComponent(
              newName.toLowerCase().trim().replace(/\s+/g, "-"),
            );

            const newWrapper = document.createElement("div");
            newWrapper.className = "chat-item-wrapper active-chat";
            newWrapper.innerHTML = `
          <a href="/conversation?user=${newUserSlug}" class="chat-item">
            <img src="${newImage}" class="profile-pic" />
            <span>${newName}</span>
          </a>`;

            chatListContainer.prepend(newWrapper);
          }
        } catch (error) {
          console.error("Error fetching new user:", error);
        }
      }
    });
  };

  loadChats();

  dropdown.addEventListener("change", (e) => {
    const sortType = e.target.value;
    loadChats(sortType);
  });

  

let requestConversationUnsub = null;
let activeRequestChat = null;

// ── Move these OUTSIDE openRequestChat so they survive re-renders ──
const renderedMessageIds = new Set();
const userCache = {};

async function openRequestChat(userId) {
  const conversationId = [senderId, userId].sort().join("_");
  const requestMessagesContainer = document.getElementById("requestMessagesContainer");
  if (!requestMessagesContainer) return;

  if (activeRequestChat === conversationId) return;
  activeRequestChat = conversationId;

  if (requestConversationUnsub) {
    requestConversationUnsub();
    requestConversationUnsub = null;
  }

  // ── Clear state when switching to a NEW conversation ──
  renderedMessageIds.clear();

  requestMessagesContainer.innerHTML = "<p>Loading...</p>";

  async function getSenderInfo(sid) {
    if (userCache[sid]) return userCache[sid];
    const userDoc = await getDoc(doc(db, "users", sid));
    userCache[sid] = {
      name: userDoc.exists() ? window.formatChatName(userDoc.data().name) : "User",
      image: userDoc.data()?.profileImage || "/default-avatar.png",
    };
    return userCache[sid];
  }

  let isFirstLoad = true;

  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
  );

  requestConversationUnsub = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      requestMessagesContainer.innerHTML = "<p>No messages yet</p>";
      renderedMessageIds.clear();
      isFirstLoad = true;
      return;
    }

    if (isFirstLoad) {
      requestMessagesContainer.innerHTML = "";
      isFirstLoad = false;

      const docs = snapshot.docs;
      const senderIds = [...new Set(docs.map(d => d.data().senderId))];
      await Promise.all(senderIds.map(getSenderInfo));

      const fragment = document.createDocumentFragment();
      for (const docSnap of docs) {
        renderedMessageIds.add(docSnap.id);
        fragment.appendChild(buildMessageEl(docSnap.data(), await getSenderInfo(docSnap.data().senderId)));
      }
      requestMessagesContainer.appendChild(fragment);

    } else {
      const newDocs = snapshot.docs.filter(d => !renderedMessageIds.has(d.id));
      if (newDocs.length === 0) return;

      const senderIds = [...new Set(newDocs.map(d => d.data().senderId))];
      await Promise.all(senderIds.map(getSenderInfo));

      const fragment = document.createDocumentFragment();
      for (const docSnap of newDocs) {
        renderedMessageIds.add(docSnap.id);
        fragment.appendChild(buildMessageEl(docSnap.data(), await getSenderInfo(docSnap.data().senderId)));
      }
      requestMessagesContainer.appendChild(fragment);
    }

    requestMessagesContainer.scrollTop = requestMessagesContainer.scrollHeight;
  });

  function buildMessageEl(data, sender) {
    const timestamp = data.timestamp?.toDate();
    const msgDiv = document.createElement("div");
    msgDiv.className = "message-item";
    msgDiv.innerHTML = `
      <div class="message-header">
        <img src="${sender.image}" class="msg-profile-pic"/>
        <div>
          <strong>${sender.name}</strong>
          <span class="time">${
            timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "Now"
          }</span>
        </div>
      </div>
      <div class="message-body">
        ${data.message ? `<p class="msg-text">${data.message}</p>` : ""}
        ${data.fileUrl ? `<img src="${data.fileUrl}" class="chat-image"/>` : ""}
      </div>
    `;
    return msgDiv;
  }
}



// =======================
// ACCEPT REQUEST
// =======================

async function acceptRequest(userId) {
  if (requestConversationUnsub) {
    requestConversationUnsub();
    requestConversationUnsub = null;
  }
  activeRequestChat = null;
  renderedMessageIds.clear();

  const convoId = [senderId, userId].sort().join("_");
  await Promise.all([
    setDoc(doc(db, "users", senderId, "chats", userId), {
      conversationId: convoId, userId, timestamp: serverTimestamp(),
    }),
    setDoc(doc(db, "users", userId, "chats", senderId), {
      conversationId: convoId, userId: senderId, timestamp: serverTimestamp(),
    }),
    deleteDoc(doc(db, "users", senderId, "requests", userId)),
    deleteDoc(doc(db, "users", userId, "requests", senderId)),

    // Notify the requester their request was accepted
    sendNotification(userId, "request_accepted", senderId),
  ]);

  document.getElementById("requestMessagesContainer").innerHTML = "<p>Request accepted</p>";
  document.getElementById("requestActionBox").innerHTML = "";
}

// =======================
// REJECT REQUEST
// =======================

async function rejectRequest(userId) {
  if (requestConversationUnsub) {
    requestConversationUnsub();
    requestConversationUnsub = null;
  }
  activeRequestChat = null;
  renderedMessageIds.clear();

  await Promise.all([
    deleteDoc(doc(db, "users", senderId, "requests", userId)),
    deleteDoc(doc(db, "users", senderId, "chats", userId)),
    deleteDoc(doc(db, "users", userId, "chats", senderId)),
    deleteDoc(doc(db, "users", userId, "requests", senderId)),

    // Notify the requester their request was rejected
    sendNotification(userId, "request_rejected", senderId),
  ]);

  document.getElementById("requestMessagesContainer").innerHTML = "<p>Request rejected</p>";
  document.getElementById("requestActionBox").innerHTML = "";
}

// =======================
// SHOW ACCEPT / REJECT
// =======================

function showRequestActions(userId) {
  const actionBox = document.getElementById("requestActionBox");
  actionBox.innerHTML = `
    <div class="request-bottom-actions">
      <button id="chatAcceptBtn">Accept</button>
      <button id="chatRejectBtn">Reject</button>
    </div>
  `;
  document.getElementById("chatAcceptBtn").onclick = () => acceptRequest(userId);
  document.getElementById("chatRejectBtn").onclick = () => rejectRequest(userId);
}

// =======================
// LOAD REQUESTS
// =======================

onSnapshot(
  query(collection(db, "users", senderId, "requests"), orderBy("timestamp", "desc")),
  async (snapshot) => {
    requestListContainer.innerHTML = "";

    requestCountBadge.innerText = snapshot.size > 0 ? snapshot.size : "";
    requestCountBadge.classList.toggle("count-hidden", snapshot.size === 0);

    if (snapshot.empty) {
      requestListContainer.innerHTML = "<p style='text-align:center;'>No requests</p>";
      return;
    }

    // ── Fetch all user docs in parallel ──
    const reqDocs = snapshot.docs.map(d => d.data());
    const userDocs = await Promise.all(
      reqDocs.map(r => getDoc(doc(db, "users", r.userId)))
    );

    const frag = document.createDocumentFragment();

    reqDocs.forEach((reqData, i) => {
      const userDoc = userDocs[i];
      const name = userDoc.exists() ? window.formatChatName(userDoc.data().name) : "Deleted User";
      const image = userDoc.data()?.profileImage?.trim() || "/default-avatar.png";

      const div = document.createElement("div");
      div.className = "request-item";
      div.innerHTML = `
        <div class="request-user">
          <img src="${image}" class="profile-pic" />
          <span>${name}</span>
        </div>
        <div class="request-actions">
          <button class="view-btn" data-id="${reqData.userId}">View Message</button>
          <button class="accept-btn" data-id="${reqData.userId}">Accept</button>
          <button class="reject-btn" data-id="${reqData.userId}">Reject</button>
        </div>
      `;

      // ── Attach listeners directly on the element, not via querySelectorAll after ──
      div.querySelector(".view-btn").addEventListener("click", () => {
        openRequestChat(reqData.userId);
        showRequestActions(reqData.userId);
      });
      div.querySelector(".accept-btn").addEventListener("click", () => acceptRequest(reqData.userId));
      div.querySelector(".reject-btn").addEventListener("click", () => rejectRequest(reqData.userId));

      frag.appendChild(div);
    });

    requestListContainer.appendChild(frag);
  }
);


// clinet notfication request

async function sendNotification(toUserId, type, fromUserId) {
  const notifRef = doc(collection(db, "users", toUserId, "notifications"));
  await setDoc(notifRef, {
    type,        // "request_accepted" | "request_rejected"
    fromUserId,
    read: false,
    timestamp: serverTimestamp(),
  });
}

function listenForNotifications(currentUserId) {
  const q = query(
    collection(db, "users", currentUserId, "notifications"),
    where("read", "==", false),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type !== "added") continue;

      const data = change.doc.data();
      const notifId = change.doc.id;

      // Fetch the other user's name for the message
      const userDoc = await getDoc(doc(db, "users", data.fromUserId));
      const name = userDoc.exists()
        ? window.formatChatName(userDoc.data().name)
        : "Someone";

      if (data.type === "request_accepted") {
        showToast(`✅ ${name} accepted your chat request!`, "success");
      } else if (data.type === "request_rejected") {
        showToast(`❌ ${name} declined your chat request.`, "error");
      }

      // Mark as read so it doesn't show again
      await updateDoc(
        doc(db, "users", currentUserId, "notifications", notifId),
        { read: true }
      );
    }
  });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  // Auto remove after 4s
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 4000);
}

// Call this after senderId is defined
listenForNotifications(senderId);


  // Lightbox Preview on image click
  document.addEventListener("click", function (e) {
    if (e.target.matches(".chat-img[data-lightbox]")) {
      const src = e.target.getAttribute("src");
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");
      lightboxImg.src = src;
      lightbox.style.display = "flex";
    }

    if (e.target.id === "lightbox" || e.target.id === "lightbox-close") {
      document.getElementById("lightbox").style.display = "none";
    }
  });
})();



// Global badge state tracker
const badgeState = {
  notifications: 0,
  messages: 0,
  update() {
    const badge = document.getElementById("notification-badge");
    if (!badge) return;
    const total = this.notifications + this.messages;
    const displayCount = total > 9 ? "9+" : total;
    badge.innerText = total > 0 ? displayCount : "";
    badge.style.display = total > 0 ? "inline-block" : "none";
  }
};

const loadNotifications = async () => {
  const userId = await getLoginId();
  const notificationList = document.getElementById("notification-list");
  const badge = document.getElementById("notification-badge");

  if (!notificationList || !userId) return;

  let unreadCount = 0;
  let hasFirestoreNotifications = false;
  let hasJobOffers = false;

  notificationList.innerHTML = ""; // Reset content

  // === Firestore Notifications ===
  const notifQuery = query(
    collection(db, "users", userId, "notifications"),
    orderBy("timestamp", "desc"),
  );
  onSnapshot(notifQuery, async (snapshot) => {
    notificationList.innerHTML = ""; // Clear on every snapshot update
    unreadCount = 0;
    hasFirestoreNotifications = !snapshot.empty;

    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const notificationId = docSnap.id;

        if (!data.read) unreadCount++;

        const item = document.createElement("div");
        item.className = `notification-item ${data.read ? "read" : "unread"}`;
        item.setAttribute("data-id", notificationId);
        item.innerHTML = `
          <div class="notification request_notfication">
            <img src="${data.senderImage}" alt="${
              data.senderName
            }" width="30" />
            <div>
              <strong>${data.title}</strong><br/>
              <p>${data.message}</p>
              <small>${
                data.timestamp?.toDate
                  ? new Date(data.timestamp.toDate()).toLocaleString()
                  : ""
              }</small>
            </div>
          </div>`;
        item.addEventListener("click", () =>
          markNotificationAsRead(userId, notificationId),
        );
        notificationList.appendChild(item);
      });
    }

    // === Job Offers (load only once) ===
    const jobQuery = query(
      collection(db, "jobOffers"),
      where("freelancerId", "==", userId),
      where("status", "==", "pending"),
    );
    const jobSnapshot = await getDocs(jobQuery);

    if (!jobSnapshot.empty) {
      hasJobOffers = true;
      jobSnapshot.forEach((docSnap) => {
        const job = docSnap.data();
        const jobId = docSnap.id;

        const jobItem = document.createElement("div");
        jobItem.className = "notification-item job-pending";
        jobItem.setAttribute("data-id", jobId);
        jobItem.innerHTML = `<div class="notification">🚨 New job offer: ${job.jobTitle}</div>`;
        notificationList.appendChild(jobItem);
      });
    }

    // === Show fallback if both are empty ===
    if (!hasFirestoreNotifications && !hasJobOffers) {
      notificationList.innerHTML =
        "<div class='no-notification'>Nothing Found</div>";
    }

    // === Update badge ===
    badgeState.notifications = unreadCount;   // ✅ replace with this
    badgeState.update();
  });
};

const markNotificationAsRead = async (userId, notificationId) => {
  await updateDoc(doc(db, "users", userId, "notifications", notificationId), {
    read: true,
  });
};

// Call this globally, e.g., in your main JS file
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("notification-list")) {
    loadNotifications();
  }
});

/* conversation tab badge */
/*
async function listenUnreadMessagesCountTab() {

  const loggedUserId = await getLoginId();
  if (!loggedUserId) return;

  const badge = document.getElementById("notification-badge");


  const userChatsRef = collection(db, `users/${loggedUserId}/chats`);

  onSnapshot(userChatsRef, (chatSnapshot) => {

    let totalUnread = 0;

    chatSnapshot.forEach((chatDoc) => {

      const { conversationId, userId } = chatDoc.data();
      if (!conversationId) return;

      const messagesRef = collection(
        db,
        `conversations/${conversationId}/messages`
      );

      const unreadQuery = query(
        messagesRef,
        where("read", "==", false),
        where("receiverId", "==", loggedUserId)
      );

      onSnapshot(unreadQuery, async (unreadSnapshot) => {

        totalUnread += unreadSnapshot.size;

        const displayCount = totalUnread > 9 ? "9+" : totalUnread;

        badgeState.messages = totalUnread;        // ✅ replace with this
        badgeState.update()

      });

    });

  });

}

listenUnreadMessagesCountTab()*/

async function listenUnreadMessagesCount() {
  const loggedUserId = await getLoginId();
  if (!loggedUserId) return;

  const notificationList = document.getElementById("notification-list");
  const badge = document.getElementById("notification-badge");
  if (!notificationList) return;

  const conversationUnreadMap = {};
  const innerListeners = [];
  let renderTimer = null;         // ← debounce handle
  let isRendering = false;        // ← prevent overlapping async renders

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderNotifications, 50); // wait 50ms for all snapshots to settle
  }

  const userChatsRef = collection(db, `users/${loggedUserId}/chats`);

  onSnapshot(userChatsRef, (chatSnapshot) => {
    // Clean up old listeners AND their data
    innerListeners.forEach((unsub) => unsub());
    innerListeners.length = 0;
    Object.keys(conversationUnreadMap).forEach(k => delete conversationUnreadMap[k]); // ← clear stale data

    chatSnapshot.forEach((chatDoc) => {
      const { conversationId } = chatDoc.data();
      if (!conversationId) return;

      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      const unreadQuery = query(
        messagesRef,
        where("read", "==", false),
        where("receiverId", "==", loggedUserId)
      );

      const unsub = onSnapshot(unreadQuery, (unreadSnapshot) => {
        // Reset just this conversation's counts
        const senderCounts = {};
        unreadSnapshot.forEach((docSnap) => {
          const { senderId } = docSnap.data();
          senderCounts[senderId] = (senderCounts[senderId] || 0) + 1;
        });
        conversationUnreadMap[conversationId] = senderCounts;

        scheduleRender(); // ← don't render immediately, debounce it
      });

      innerListeners.push(unsub);
    });
  });

  async function renderNotifications() {
    if (isRendering) {
      scheduleRender(); // ← if already rendering, re-schedule instead of overlapping
      return;
    }
    isRendering = true;

    // Merge all conversations into one senderMap
    const senderMap = {};
    for (const convId in conversationUnreadMap) {
      for (const [senderId, count] of Object.entries(conversationUnreadMap[convId])) {
        senderMap[senderId] = (senderMap[senderId] || 0) + count;
      }
    }

    const totalUnread = Object.values(senderMap).reduce((a, b) => a + b, 0);

    // Fetch all user docs in parallel before touching the DOM
    const senderEntries = await Promise.all(
      Object.entries(senderMap).map(async ([senderId, count]) => {
        const userDoc = await getDoc(doc(db, "users", senderId));
        return {
          senderId,
          count,
          name: userDoc.exists() ? window.formatChatName(userDoc.data().name) : "User",
          image: userDoc.data()?.profileImage || "/default-avatar.png",
        };
      })
    );

    // Only touch the DOM once, after all data is ready
    notificationList.innerHTML = "";
    for (const { senderId, count, name, image } of senderEntries) {
      const item = document.createElement("div");
      item.className = "notification-item unread";
      item.innerHTML = `
        <div class="notification">
          <img src="${image}" class="notif-avatar"/>
          <div>
            <strong>${name}</strong>
            <p>You got ${count} new message${count > 1 ? "s" : ""} from ${name}</p>
          </div>
        </div>
      `;
      item.addEventListener("click", () => {
        window.location.href = `/messages?user=${senderId}`;
      });
      notificationList.appendChild(item);
    }

    badgeState.messages = totalUnread;       // ✅ replace with this
    badgeState.update();

    isRendering = false;
  }
}

listenUnreadMessagesCount();

// finance page =============

// filter component =================

window.applyDateFilter = ({
  selectElId,
  customRangeDivId,
  applyBtnId,
  startInputId,
  endInputId,
  onDateRangeSelected,
}) => {
  const dateFilter = document.getElementById(selectElId);
  const customRangeDiv = document.getElementById(customRangeDivId);
  const applyCustomBtn = document.getElementById(applyBtnId);
  const startInput = document.getElementById(startInputId);
  const endInput = document.getElementById(endInputId);

  if (
    !dateFilter ||
    !customRangeDiv ||
    !applyCustomBtn ||
    !startInput ||
    !endInput
  ) {
    return;
  }

  dateFilter.addEventListener("change", () => {
    const value = dateFilter.value;
    if (value === "custom") {
      customRangeDiv.style.display = "block";
    } else {
      customRangeDiv.style.display = "none";

      if (value === "all") {
        onDateRangeSelected(null, null); // Show all
      } else {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - parseInt(value));
        pastDate.setHours(0, 0, 0, 0);
        onDateRangeSelected(pastDate, now);
      }
    }
  });

  applyCustomBtn.addEventListener("click", () => {
    const start = startInput.value;
    const end = endInput.value;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      onDateRangeSelected(startDate, endDate);
    } else {
      alert("Please select both start and end dates.");
    }
  });
};

const quill = new Quill("#description-editor", {
  theme: "snow",
  placeholder: "Write job description here...",
});

// book now page ==================
async function hireFreelancer(freelancerId, amount, jobData, clientId) {
  const clientEmail = await getEmailId();

  try {
    const response = await fetch(
      "https://us-central1-tallyhotemps.cloudfunctions.net/createCheckoutSession",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerId,
          amount,
          clientEmail,
          clientId: jobData?.clientId,
          jobTitle: jobData?.jobTitle || "", // assuming jobTitle is inside jobData
        }),
      },
    );

    const result = await response.json();
    if (result.url) {
      sessionStorage.setItem("pendingJobData", JSON.stringify(jobData));
      sessionStorage.setItem("previousPage", window.location.href);
      window.location.href = result.url;
    } else {
      alert("Could not start checkout.");
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const submitBtn = document.getElementById("submit-job-btn");
  const fromInput = document.querySelector("#Job-from");
  const hourInput = document.querySelector("#Hour");
  const toInput = document.querySelector("#Job-to");
  const loggedInUserId = await getLoginId();

  function getFreelancerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId");
  }

  const calculateToTime = () => {
    const fromValue = fromInput?.value;
    const hoursValue = Number(hourInput?.value);
    if (fromValue && hoursValue > 0) {
      const fromDate = new Date(fromValue);
      const toDate = new Date(fromDate.getTime() + hoursValue * 60 * 60 * 1000);
      const year = toDate.getFullYear();
      const month = String(toDate.getMonth() + 1).padStart(2, "0");
      const day = String(toDate.getDate()).padStart(2, "0");
      const hours = String(toDate.getHours()).padStart(2, "0");
      const minutes = String(toDate.getMinutes()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
      toInput.value = formatted;
    }
  };

  if (fromInput && hourInput) {
    fromInput.addEventListener("change", calculateToTime);
    hourInput.addEventListener("input", calculateToTime);
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      const freelancerId = getFreelancerIdFromUrl();
      const clientId = loggedInUserId;
      const jobTitle = document.querySelector("#Job-title")?.value.trim();
      const location = document.querySelector("#location")?.value.trim();
      const hours = Number(document.querySelector("#Hour")?.value);
      const perHour = Number(document.querySelector("#Per-Hour")?.value);
      const from = document.querySelector("#Job-from")?.value;
      const to = document.querySelector("#Job-to")?.value;
      const description = quill.root.innerHTML.trim();

      if (
        !freelancerId ||
        !jobTitle ||
        !location ||
        !hours ||
        !perHour ||
        !from ||
        !to ||
        !description
      ) {
        alert("Please fill in all required fields.");
        return;
      }

      const amount = hours * perHour;
      const serviceCharge = amount * 0.05;
      const total = amount + serviceCharge;

      const jobData = {
        clientId,
        freelancerId,
        jobTitle,
        location,
        hours,
        perHour,
        from,
        to,
        description,
        amount,
        serviceCharge,
        total,
        status: "pending",
        paymentStatus: "paid",
      };

      // Set hire button values
      const hireButton = document.querySelector(".hire-button");
      if (hireButton) {
        hireButton.setAttribute("data-amount", total.toFixed(2));
        hireButton.setAttribute("data-freelancer-id", freelancerId);
        hireButton.setAttribute("data-job", JSON.stringify(jobData)); // Attach job data
      }
    });
  }

  // Handle click on "Hire Freelancer" buttons
  document.querySelectorAll(".hire-button").forEach((button) => {
    button.addEventListener("click", () => {
      const freelancerId = button.getAttribute("data-freelancer-id");
      const amount = parseFloat(button.getAttribute("data-amount"));
      const jobData = JSON.parse(button.getAttribute("data-job"));
      hireFreelancer(freelancerId, amount, jobData);
    });
  });
});

// ✅ Client View: Load Pending Verifications
document.addEventListener("DOMContentLoaded", async function () {
  const loadClientPendingVerifications = async () => {
    const container = document.getElementById("client-verification-list");
    if (!container) return;
    container.innerHTML = "";

    const q = query(
      collection(db, "jobOffers"),
      where("clientId", "==", loggedInUserId),
      where("status", "==", "awaiting-client-verification"),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `<p>No jobs awaiting verification.</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const job = docSnap.data();
      const jobId = docSnap.id;

      const jobEl = document.createElement("div");
      jobEl.innerHTML = `
        <div class="client-job-post job-post-flex">
            <div>
              <div class="job-post-badge">
                <div>${job.location}</div>
              </div>
              <div class="text-size-regular text-weight-semibold">${job.jobTitle}</div>
              <a href="/job-detail?id=${jobId}" class="text-size-tiny">View Details</a>
            </div>
            <div class="button-group">
              <button onclick="verifyComplete('${jobId}')" class="button is-small w-button">✅ Verify & Complete</button>
            </div>
          </div>
        
        <hr/>
      `;
      container.appendChild(jobEl);
    });
  };

  window.verifyComplete = async (jobId) => {
    await updateDoc(doc(db, "jobOffers", jobId), {
      status: "completed",
      completedAt: serverTimestamp(),
    });
    alert("🎉 Job marked as completed!");
    loadClientPendingVerifications();
    await markTransferPendingRequest(jobId);
  };

  // Load verifications after user data is fetched
  const loggedInUserId = await getLoginId();

  loadClientPendingVerifications();
}); // <-- make sure this closes the DOMContentLoaded properly

// ✅ Global Load More Function
window.renderLoadMore = (container, itemArray, btnId, step = 2) => {
  let visibleCount = 0;

  itemArray.forEach((el) => {
    el.style.display = "none";
    container.appendChild(el);
  });

  const btn = document.createElement("button");
  btn.id = btnId;
  btn.className = "button is-small w-button";
  btn.textContent = "Load More";
  btn.style.marginTop = "1rem";

  const showNext = () => {
    for (let i = visibleCount; i < visibleCount + step; i++) {
      if (itemArray[i]) itemArray[i].style.display = "block";
    }
    visibleCount += step;
    if (visibleCount >= itemArray.length) btn.style.display = "none";
  };

  btn.addEventListener("click", showNext);
  container.appendChild(btn);
  showNext();
};

// home page service filter ==============

document.addEventListener("DOMContentLoaded", function () {
  const categoryLinks = document.querySelectorAll(".service-link");

  categoryLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const category = link.getAttribute("data-service"); // Get service name
      const targetUrl = `/client-pages/freelancer-directory?service_equal=%5B"${encodeURIComponent(
        category,
      )}"%5D`;

      window.location.href = targetUrl;
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const selectedService = urlParams.get("service_equal");

  if (selectedService) {
    const checkboxes = document.querySelectorAll(".service-checkbox-item");

    checkboxes.forEach((checkbox) => {
      const serviceName = checkbox
        .querySelector("input")
        .getAttribute("fs-list-value")
        .trim();

      if (serviceName === selectedService.trim()) {
        const checkboxDiv = checkbox.querySelector(".service-checkbox");
        checkbox.classList.add("is-list-active");
        checkboxDiv.classList.add("w--redirected-checked"); // Add the class to the div
      }
    });
  }
});

// multi step signup form=======================

// ============ page 1 ===========

document.addEventListener("DOMContentLoaded", function () {
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategories = urlParams.get("service");

  if (selectedCategories) {
    const categoryArray = selectedCategories.split(",");

    document
      .querySelectorAll('input[name="Filter-One-Option-1"]')
      .forEach((checkbox) => {
        if (categoryArray.includes(checkbox.getAttribute("data-service"))) {
          checkbox.checked = true; // Auto-check matching checkboxes
        }
      });
  }
});

// onboarding page 4 location =============

$(".service-item").each(function () {
  var s = $(this).text();
  $(".service-field").append('<option value="' + s + '">' + s + "</option>");
});

let added = new Set();

$(".service-text").each(function () {
  let s = $(this).text().trim();
  if (!added.has(s)) {
    $(".service-field").append('<option value="' + s + '">' + s + "</option>");
    added.add(s);
  }
});

$(".ms-profile-image-preview")
  .on("load", function () {
    let imageSrc = $(this).attr("srcset");

    if (imageSrc && imageSrc.trim() !== "") {
      $('input[profile-image="true"]').removeAttr("required");
      $("#errorMsg").css("display", "none"); // hide error message
    } else {
      $("#errorMsg").css("display", "block"); // show error message
    }
  })
  .each(function () {
    if (this.complete) $(this).trigger("load"); // trigger load for cached images
  });

document.addEventListener("DOMContentLoaded", function () {
  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const fields = document.querySelectorAll("[ms-code-require]");
  fields.forEach((field) => {
    const errorElement = document.querySelector(
      `[ms-code-require-error="${field.getAttribute("ms-code-require")}"]`,
    );
    if (errorElement) {
      errorElement.style.display = "none";
    }

    const form = field.closest("form");
    const submitButton = form
      ? form.querySelector(
          `[ms-code-submit-button="${field.getAttribute("ms-code-require")}"]`,
        )
      : null;

    function validateField() {
      const value = field.value.trim(); // only check for trimmed (non-space) value
      const isValid = value !== "";

      if (errorElement) {
        errorElement.style.display = isValid ? "none" : "block";
      }
      if (submitButton) {
        submitButton.style.opacity = isValid ? "1" : "0.5";
        submitButton.style.pointerEvents = isValid ? "auto" : "none";
      }
      return isValid;
    }

    const debouncedValidate = debounce(validateField, 500);

    field.addEventListener("blur", validateField);
    field.addEventListener("input", debouncedValidate);

    if (form) {
      form.addEventListener("submit", function (event) {
        if (!validateField() && submitButton) {
          event.preventDefault();
          field.focus();
        }
      });
    }
  });
});

/* Name formetting *****/

window.formatChatName = function (fullName) {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  }
  return fullName;
};

function formatName(el) {
  if (el.dataset.formatted) return;

  const fullName = el.textContent.trim();
  const parts = fullName.split(" ");
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    el.textContent = `${firstName} ${lastInitial}.`;
    el.dataset.formatted = "true"; // mark as done
  }
}

function formatAllNames() {
  document.querySelectorAll("[data-formet-name]").forEach(formatName);
}

// Run on initial load
document.addEventListener("DOMContentLoaded", formatAllNames);

// Watch for dynamically added freelancers
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    mutation.addedNodes.forEach(function (node) {
      if (node.nodeType !== 1) return; // skip non-elements

      if (node.hasAttribute("data-formet-name")) {
        formatName(node);
      }

      node.querySelectorAll?.("[data-formet-name]").forEach(formatName);
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
