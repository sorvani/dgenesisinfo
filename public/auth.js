// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQUZ5NTKDNmY0-RyfzUOrxwSfHs8hE-Rc",
    authDomain: "d-genesis-info.firebaseapp.com",
    projectId: "d-genesis-info",
    storageBucket: "d-genesis-info.firebasestorage.app",
    messagingSenderId: "552093452402",
    appId: "1:552093452402:web:9be4caf14f2dcaa8a31aeb",
    measurementId: "G-2H2DYEB1WE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userDisplay = document.getElementById("user-info");

// Handle login with Google
loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
});

// Handle logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).catch(error => console.error(error));
});

// Listen for login state changes
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const editDataLink = document.getElementById("edit-data");

    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline";
        editDataLink.style.display = "inline";
    } else {
        loginBtn.style.display = "inline";
        logoutBtn.style.display = "none";
        editDataLink.style.display = "none";
    }
});

// UI Elements for editing
const editSection = document.getElementById("edit-section");
const editContent = document.getElementById("edit-content");
const saveBtn = document.getElementById("save-btn");
const editDataLink = document.getElementById("edit-data");

// Function to load existing data from Firestore
async function loadData() {
    const docRef = doc(db, "siteData", "editableContent");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        editContent.value = docSnap.data().content;
    } else {
        editContent.value = "No content found.";
    }
}

// Function to save new data to Firestore
async function saveData() {
    const newData = editContent.value;

    try {
        await setDoc(doc(db, "siteData", "editableContent"), { content: newData });
        alert("Data saved successfully!");
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Failed to save data.");
    }
}

// Modify the existing onAuthStateChanged to include edit permissions
onAuthStateChanged(auth, (user) => {
    if (user) {
        editDataLink.style.display = "inline";
        loadData(); // Load existing data
    } else {
        editDataLink.style.display = "none";
        editSection.style.display = "none";
    }
});

// Show the edit section when clicking "Edit Data"
editDataLink.addEventListener("click", () => {
    editSection.style.display = "block";
});

// Handle saving data
saveBtn.addEventListener("click", saveData);