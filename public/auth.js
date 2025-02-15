// Import Firebase modules
import { firebaseApp } from "./firebase-config.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        logoutBtn.innerHTML=`Logout: ${user.displayName}`;
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
        console.log("Can Edit:", canEdit);
        console.log("Edit Sections Found:", editSections.length);
        editSections.forEach(section => {
            section.style.visibility = "hidden";
        });
    }).catch(error => console.error(error));
});

async function checkAndUpdateUser(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || "Anonymous",
            email: user.email,
            canEdit: false, //amdin must manually set this to true.
        });
        console.log("New user document created");
        return false
    } else {
        // Only get canEdit from Firestore
        const canEdit = userSnap.data().canEdit || false;
        console.log(`User already exists, Firestore canEdit:`, canEdit);
        return canEdit;
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User signed in:", user);
        // Fetch user data and wait for Firestore response
        const canEdit = await checkAndUpdateUser(user);
        
        // Explicitly update UI to show the logged-in state
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline";
        document.getElementById("logout-btn").innerHTML=`Logout: ${user.displayName}`;
        // Ensure edit column updates after Firestore has returned canEdit
        setTimeout(() => {
            console.log("Finalizing UI updates after Firestore fetch.");
            // Update visibility for the edit column
            updateEditColumnVisibility(canEdit);
        }, 300); // Small delay to prevent race conditions

    } else {
        console.log("No user signed in");
        
        // Hide edit functionality
        updateEditColumnVisibility(false);

        // Reset UI for logged-out state
        document.getElementById("login-btn").style.display = "inline";
        document.getElementById("logout-btn").style.display = "none";
    }
});

function updateEditColumnVisibility(canEdit) {
    // Get all current and future `.edit-section` elements
    const editSections = document.querySelectorAll(".edit-section");

    editSections.forEach(section => {
        section.style.display = canEdit ? "table-cell" : "none";
    });

    console.log(`Updated ${editSections.length} elements to ${canEdit ? "show" : "hide"} edit column.`);
}
