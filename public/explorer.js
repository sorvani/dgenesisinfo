// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
//import { getFirestore, collection, getDocs, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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
const db = getFirestore(app);

// Connect to Firestore Emulator (for local testing)
//connectFirestoreEmulator(db, "localhost", 8080);

// Function to Fetch Data
async function fetchExplorers() {
    const explorerList = document.getElementById("explorer-list");
    explorerList.innerHTML = "<li>Loading...</li>";

    try {
        const explorerCollection = collection(db, "explorer");
        const querySnapshot = await getDocs(explorerCollection);

        explorerList.innerHTML = ""; // Clear loading state

        querySnapshot.forEach((doc) => {
            const explorer = doc.data();
            const listItem = document.createElement("li");
            listItem.textContent = `Name: ${explorer.name}, Level: ${explorer.level}, Orbs: ${explorer.orbs}`;
            explorerList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching explorers:", error);
        explorerList.innerHTML = "<li>Error loading details</li>";
    }
}

// Run fetch on page load
fetchExplorers();
