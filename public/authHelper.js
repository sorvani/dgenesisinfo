import { auth } from "./auth.js"; // Import Firebase Auth instance
import { getFirestore, doc, getDoc } 
    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(); // Initialize Firestore

// Function to check if a user can edit
export async function checkUserCanEdit() {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user logged in.");
        return false; // Not logged in, no edit permissions
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const canEdit = userSnap.data().canEdit || false;
            console.log(`User ${user.uid} canEdit:`, canEdit);
            return canEdit;
        }
    } catch (error) {
        console.error("Error fetching user permissions:", error);
    }

    return false;
}

// Function to show/hide Edit column dynamically
export function updateEditColumnVisibility(canEdit) {
    console.log(`updateEditColumnVisibility() called with canEdit:`, canEdit, "Type:", typeof canEdit);

    // Convert canEdit to a boolean to avoid any issues with unexpected values
    canEdit = Boolean(canEdit);

    const editSections = document.querySelectorAll(".edit-section");
    console.log(`Found ${editSections.length} elements with class edit-section`);

    editSections.forEach(section => {
        console.log(`Setting display to ${canEdit ? "table-cell" : "none"} for`, section);
        section.style.display = canEdit ? "table-cell" : "none";
    });

    console.log(`Updated ${editSections.length} elements to ${canEdit ? "show" : "hide"} edit column.`);
}
