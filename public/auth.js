// Import Firebase modules
import { firebaseApp } from "./firebase-config.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeEditButtons } from "./authHelper.js"; // Import for edit buttons

// Initialize Firebase
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const db = getFirestore(firebaseApp);

// Export `auth` so it can be used in `authHelper.js`
export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };

// UI Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

// Handle login
loginBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await checkAndUpdateUser(user);
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline";
        logoutBtn.innerHTML = `Logout: ${user.displayName}`;
    } catch (error) {
        console.error("Login failed:", error);
    }
});

// Handle logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("User logged out");
        logoutBtn.style.display = "none";
        loginBtn.style.display = "inline";
        updateEditColumnVisibility(false);
    }).catch(error => console.error(error));
});

async function checkAndUpdateUser(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || "Anonymous",
            email: user.email,
            canEdit: false,
        });
        console.log("New user document created");
        return false;
    } else {
        const canEdit = userSnap.data().canEdit || false;
        console.log(`User already exists, Firestore canEdit:`, canEdit);
        return canEdit;
    }
}

// Listen for authentication state changes
let currentCanEdit = false;
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User signed in:", user);
        const canEdit = await checkAndUpdateUser(user);
        currentCanEdit = canEdit;
        
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline";
        document.getElementById("logout-btn").innerHTML = `Logout: ${user.displayName}`;

        setTimeout(() => {
            console.log("Finalizing UI updates after Firestore fetch.");
            updateEditColumnVisibility(canEdit);
            if (canEdit) {
                initializeEditButtons();
            }
        }, 500); // 500ms delay
    } else {
        console.log("No user signed in");
        currentCanEdit = false;
        updateEditColumnVisibility(false);
        document.getElementById("login-btn").style.display = "inline";
        document.getElementById("logout-btn").style.display = "none";
    }
});

function updateEditColumnVisibility(canEdit) {
    const editSections = document.querySelectorAll(".edit-section");
    editSections.forEach(section => {
        section.style.display = canEdit ? "table-cell" : "none";
    });
    console.log(`Updated ${editSections.length} elements to ${canEdit ? "show" : "hide"} edit column.`);
}