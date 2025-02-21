import { auth } from "./auth.js";
import { 
    getFirestore, doc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

export async function checkUserCanEdit() {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user logged in.");
        return false;
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

export function updateEditColumnVisibility(canEdit) {
    console.log(`updateEditColumnVisibility() called with canEdit:`, canEdit, "Type:", typeof canEdit);
    canEdit = Boolean(canEdit);
    const editSections = document.querySelectorAll(".edit-section");
    console.log(`Found ${editSections.length} elements with class edit-section`);
    editSections.forEach(section => {
        console.log(`Setting display to ${canEdit ? "table-cell" : "none"} for`, section);
        section.style.display = canEdit ? "table-cell" : "none";
    });
    console.log(`Updated ${editSections.length} elements to ${canEdit ? "show" : "hide"} edit column.`);
}

export function initializeEditButtons() {
    const editButtons = document.querySelectorAll(".edit-section button");
    console.log(`Found ${editButtons.length} edit buttons`);

    editButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            e.stopPropagation(); // Prevent row click events (e.g., toggle details)
            const docId = e.target.dataset.docId;
            if (docId) {
                const canEdit = await checkUserCanEdit();
                if (canEdit) {
                    const tableId = e.target.closest('table').id;
                    if (tableId === "explorer-table") {
                        editExplorer(docId);
                    } else if (tableId === "orb-table") {
                        editOrb(docId);
                    }
                } else {
                    console.log("User lacks permission to edit");
                    alert("You don’t have permission to edit.");
                }
            } else {
                console.error("No docId found on button");
            }
        });
    });
}

let currentDocId = null;
let currentCollection = null;

async function editExplorer(docId) {
    try {
        console.log("Fetching explorer data for docId:", docId);
        const explorerRef = doc(db, "explorer", docId);
        const explorerSnap = await getDoc(explorerRef);

        if (explorerSnap.exists()) {
            console.log("Explorer data fetched:", explorerSnap.data());
            currentDocId = docId;
            currentCollection = "explorer";
            const data = explorerSnap.data();
            const modal = document.getElementById("edit-modal");
            const form = modal.querySelector("form");
            const title = modal.querySelector("h3");

            title.textContent = "Edit Explorer";
            form.innerHTML = `
                <label>First Name: <input type="text" name="first_name" value="${data.first_name || ''}"></label><br>
                <label>Last Name: <input type="text" name="last_name" value="${data.last_name || ''}"></label><br>
                <label>Moniker: <input type="text" name="moniker" value="${data.moniker || ''}"></label><br>
                <label>Nationality: <input type="text" name="nationality" value="${data.nationality || ''}"></label><br>
                <label>Date First Known: <input type="date" name="date_first_known" value="${data.date_first_known ? new Date(data.date_first_known).toISOString().split('T')[0] : ''}"></label><br>
            `;
            addModalButtons(form);
            console.log("Showing explorer modal");
            modal.style.display = "block";
        } else {
            console.error("Explorer document does not exist:", docId);
        }
    } catch (error) {
        console.error("Error in editExplorer:", error);
        alert("Failed to load explorer data.");
    }
}

async function editOrb(docId) {
    try {
        const orbRef = doc(db, "orb", docId);
        const orbSnap = await getDoc(orbRef);

        if (orbSnap.exists()) {
            currentDocId = docId;
            currentCollection = "orb";
            const data = orbSnap.data();
            const modal = document.getElementById("edit-modal");
            const form = modal.querySelector("form");
            const title = modal.querySelector("h3");

            title.textContent = "Edit Orb";
            form.innerHTML = `
                <label>Orb Name: <input type="text" name="orb_name" value="${data.orb_name || ''}"></label><br>
                <label>Known Effects: <textarea name="known_effects">${data.known_effects || ''}</textarea></label><br>
                <label>Note: <textarea name="note">${data.note || ''}</textarea></label><br>
            `;
            addModalButtons(form);
            modal.style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching orb:", error);
        alert("Failed to load orb data.");
    }
}

function addModalButtons(form) {
    form.innerHTML += `
        <button type="button" onclick="import('/authHelper.js').then(module => module.saveEdit())">Save</button>
        <button type="button" onclick="document.getElementById('edit-modal').style.display = 'none'">Cancel</button>
    `;
}

export async function saveEdit() {
    try {
        const modal = document.getElementById("edit-modal");
        const form = modal.querySelector("form");
        let updates = {};

        if (currentCollection === "explorer") {
            updates = {
                first_name: form.first_name.value || null,
                last_name: form.last_name.value || null,
                moniker: form.moniker.value || null,
                nationality: form.nationality.value || null,
                date_first_known: form.date_first_known.value ? new Date(form.date_first_known.value).toISOString() : null
            };
        } else if (currentCollection === "orb") {
            updates = {
                orb_name: form.orb_name.value || null,
                known_effects: form.known_effects.value || null,
                note: form.note.value || null
            };
        }

        const docRef = doc(db, currentCollection, currentDocId);
        await updateDoc(docRef, updates);
        modal.style.display = "none";
        console.log(`${currentCollection} ${currentDocId} updated successfully`);
        window.location.reload();
    } catch (error) {
        console.error("Error saving edit:", error);
        alert("Failed to save changes.");
    }
}