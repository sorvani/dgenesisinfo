// auth.js
// Import Firebase modules
//import { firebaseApp } from "./firebase-config.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
/*
import { 
    getFirestore, collection, getDocs, query, where, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
*/

// Initialize Firebase
//const db = getFirestore(firebaseApp);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

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
        logoutBtn.innerHTML =`Logout: ${user.displayName}`;
    } else {
        loginBtn.style.display = "inline"; // change to inline to show
        logoutBtn.style.display = "none";
    }
});
