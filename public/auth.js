// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getFirestore, collection, getDocs, query, where, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const editDataLink = document.getElementById("edit-data");
const editSection = document.getElementById("edit-section");
const editContent = document.getElementById("edit-content");
const saveBtn = document.getElementById("save-btn");
const explorerTable = document.getElementById("explorer-table");

let selectedItemId = null; // Stores the ID of the selected item

// Handle login
loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
});

// Handle logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).catch(error => console.error(error));
});

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline";
        editDataLink.style.display = "none"; // change to inline to show
    } else {
        loginBtn.style.display = "none"; // change to inline to show
        logoutBtn.style.display = "none";
        editDataLink.style.display = "none";
        editSection.style.display = "none";
    }
});

// Function to load data for editing
async function loadData(itemId, collectionName) {
    selectedItemId = null; // Reset selected item ID
    console.log("Fetching from:", collectionName, "where ID =", itemId);

    let queryField = collectionName === "explorer" ? "id" : "orb_id";
    const q = query(collection(db, collectionName), where(queryField, "==", Number(itemId))); // Ensure itemId is a number

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Get the first matching document
        console.log("Document data:", docSnap.data());

        selectedItemId = docSnap.id; // Store Firestore document name (actual ID)
        editContent.value = JSON.stringify(docSnap.data(), null, 2);
    } else {
        console.error("No document found for", itemId);
        editContent.value = "No data found.";
    }

    editSection.style.display = "none"; // change to block to show
}

// Function to save edited data
async function saveData() {
    if (!selectedItemId) {
        alert("No item selected for editing.");
        return;
    }

    try {
        const updatedData = JSON.parse(editContent.value); // Convert text back to JSON
        console.log("Updating Firestore document:", selectedItemId, "with data:", updatedData);
        const collectionName = selectedItemId.startsWith("orb-") ? "orb" : "explorer"; // Determine the collection
        const docRef = doc(db, collectionName, selectedItemId);
        await setDoc(docRef, updatedData, { merge: true });
        alert("Data saved successfully!");
        // Hide edit section
        editSection.style.display = "none";
        // Dispatch a custom event to notify other scripts to reload the table
        document.dispatchEvent(new CustomEvent("dataUpdated", { detail: { collection: collectionName } }));
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Failed to save data.");
    }
}

// Handle table row clicks for editing
document.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (!row || !row.dataset.id) return;

    const table = row.closest("table");
    let collectionName = "";

    if (table.id === "explorer-table") {
        collectionName = "explorer";
    } else if (table.id === "orb-table") {
        collectionName = "orb";
    }

    if (collectionName) {
        loadData(row.dataset.id, collectionName);
    } else {
        console.error("Unknown table clicked.");
    }
});


// Handle save button click
saveBtn.addEventListener("click", saveData);
