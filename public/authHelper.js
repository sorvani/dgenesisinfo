import { auth } from "./auth.js";
import { 
    getFirestore, doc, getDoc, updateDoc, setDoc, collection, getDocs 
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
            e.stopPropagation();
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
                <h4>Rankings</h4>
                <div id="rankings-container"></div><button type="button" onclick="addRanking()">Add Ranking</button><br>
                <h4>Stats</h4>
                <div id="stats-container"></div><button type="button" onclick="addStat()">Add Stat</button><br>
                <h4>Orbs Used</h4>
                <div id="orbs-used-container"></div><button type="button" onclick="addOrbUsed()">Add Orb Used</button><br>
            `;
            await renderSubItemsWithCitations(data.rankings || [], "rankings-container", renderRanking);
            await renderSubItemsWithCitations(data.stats || [], "stats-container", renderStat);
            await renderSubItemsWithCitations(data.orbs_used || [], "orbs-used-container", renderOrbUsed);
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
        console.log("Fetching orb data for docId:", docId);
        const orbRef = doc(db, "orb", docId);
        const orbSnap = await getDoc(orbRef);

        if (orbSnap.exists()) {
            console.log("Orb data fetched:", orbSnap.data());
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
                <h4>Drop Rates</h4>
                <div id="drop-rates-container"></div><button type="button" onclick="addDropRate()">Add Drop Rate</button><br>
            `;
            await renderSubItemsWithCitations(data.drop_rates || [], "drop-rates-container", renderDropRate);
            addModalButtons(form);
            console.log("Showing orb modal");
            modal.style.display = "block";
        } else {
            console.error("Orb document does not exist:", docId);
        }
    } catch (error) {
        console.error("Error in editOrb:", error);
        alert("Failed to load orb data.");
    }
}

// Render sub-items with citation subcollection support
async function renderSubItemsWithCitations(items, containerId, renderFunction) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (const [index, item] of items.entries()) {
        const citationId = item.citationId;
        const citationData = citationId ? await getCitationData(citationId, currentCollection, currentDocId) : { chapter: '', jnc_part: '', volume: '' };
        const div = document.createElement('div');
        div.className = 'sub-item';
        div.innerHTML = renderFunction({ ...item, citationId }, index, citationData);
        container.appendChild(div);
    }
}

// Fetch citation data from subcollection
async function getCitationData(citationId, collection, docId) {
    try {
        const citationRef = doc(db, `${collection}/${docId}/citations`, citationId);
        const citationSnap = await getDoc(citationRef);
        if (citationSnap.exists()) {
            return citationSnap.data();
        }
        console.log(`No citation found for ${docId}/${citationId}, using default`);
        return { chapter: '', jnc_part: '', volume: '' };
    } catch (error) {
        console.error("Error fetching citation:", error);
        return { chapter: '', jnc_part: '', volume: '' };
    }
}

// Render functions updated for citation subcollection
function renderRanking(item, index, citationData) {
    return `
        <label>Rank: <input type="number" name="rankings[${index}][rank]" value="${item.rank || ''}"></label>
        <label>Known Above Rank: <input type="number" name="rankings[${index}][known_above_rank]" value="${item.known_above_rank || ''}"></label>
        <label>Date Noted: <input type="date" name="rankings[${index}][date_noted]" value="${item.date_noted ? new Date(item.date_noted).toISOString().split('T')[0] : ''}"></label>
        <label>Chapter: <input type="text" name="rankings[${index}][citation][chapter]" value="${citationData.chapter || ''}"></label>
        <label>JNC Part: <input type="text" name="rankings[${index}][citation][jnc_part]" value="${citationData.jnc_part || ''}"></label>
        <label>Volume: <input type="text" name="rankings[${index}][citation][volume]" value="${citationData.volume || ''}"></label>
        <button type="button" onclick="removeSubItem('rankings', ${index})">Remove</button><br>
    `;
}

function renderStat(item, index, citationData) {
    return `
        <label>Date Noted: <input type="date" name="stats[${index}][date_noted]" value="${item.date_noted ? new Date(item.date_noted).toISOString().split('T')[0] : ''}"></label>
        <label>Scan Type: <input type="text" name="stats[${index}][scan_type]" value="${item.scan_type || ''}"></label>
        <label>SP: <input type="number" name="stats[${index}][sp]" value="${item.sp || ''}"></label>
        <label>HP: <input type="number" step="0.01" name="stats[${index}][hp]" value="${item.hp || ''}"></label>
        <label>MP: <input type="number" step="0.01" name="stats[${index}][mp]" value="${item.mp || ''}"></label>
        <label>STR: <input type="number" name="stats[${index}][str]" value="${item.str || ''}"></label>
        <label>VIT: <input type="number" name="stats[${index}][vit]" value="${item.vit || ''}"></label>
        <label>INT: <input type="number" name="stats[${index}][int]" value="${item.int || ''}"></label>
        <label>AGI: <input type="number" name="stats[${index}][agi]" value="${item.agi || ''}"></label>
        <label>DEX: <input type="number" name="stats[${index}][dex]" value="${item.dex || ''}"></label>
        <label>LUC: <input type="number" name="stats[${index}][luc]" value="${item.luc || ''}"></label>
        <label>Stat Total: <input type="number" name="stats[${index}][stat_total]" value="${item.stat_total || ''}"></label>
        <label>Points From Average: <input type="number" name="stats[${index}][points_from_average]" value="${item.points_from_average || ''}"></label>
        <label>Date Sequence: <input type="text" name="stats[${index}][date_sequence]" value="${item.date_sequence || ''}"></label>
        <label>Chapter: <input type="text" name="stats[${index}][citation][chapter]" value="${citationData.chapter || ''}"></label>
        <label>JNC Part: <input type="text" name="stats[${index}][citation][jnc_part]" value="${citationData.jnc_part || ''}"></label>
        <label>Volume: <input type="text" name="stats[${index}][citation][volume]" value="${citationData.volume || ''}"></label>
        <button type="button" onclick="removeSubItem('stats', ${index})">Remove</button><br>
    `;
}

function renderOrbUsed(item, index, citationData) {
    return `
        <label>Orb ID: <input type="text" name="orbs_used[${index}][orb_id]" value="${item.orb_id || ''}"></label>
        <label>Date Acquired: <input type="date" name="orbs_used[${index}][date_acquired]" value="${item.date_acquired ? new Date(item.date_acquired).toISOString().split('T')[0] : ''}"></label>
        <label>Date Note: <input type="text" name="orbs_used[${index}][date_note]" value="${item.date_note || ''}"></label>
        <label>Chapter: <input type="text" name="orbs_used[${index}][citation][chapter]" value="${citationData.chapter || ''}"></label>
        <label>JNC Part: <input type="text" name="orbs_used[${index}][citation][jnc_part]" value="${citationData.jnc_part || ''}"></label>
        <label>Volume: <input type="text" name="orbs_used[${index}][citation][volume]" value="${citationData.volume || ''}"></label>
        <button type="button" onclick="removeSubItem('orbs_used', ${index})">Remove</button><br>
    `;
}

function renderDropRate(item, index, citationData) {
    return `
        <label>Creature: <input type="text" name="drop_rates[${index}][creature]" value="${item.creature || ''}"></label>
        <label>Dungeon: <input type="text" name="drop_rates[${index}][dungeon]" value="${item.dungeon || ''}"></label>
        <label>Probability: <input type="number" step="0.01" name="drop_rates[${index}][probability]" value="${item.probability || ''}"></label>
        <label>Chapter: <input type="text" name="drop_rates[${index}][citation][chapter]" value="${citationData.chapter || ''}"></label>
        <label>JNC Part: <input type="text" name="drop_rates[${index}][citation][jnc_part]" value="${citationData.jnc_part || ''}"></label>
        <label>Volume: <input type="text" name="drop_rates[${index}][citation][volume]" value="${citationData.volume || ''}"></label>
        <button type="button" onclick="removeSubItem('drop_rates', ${index})">Remove</button><br>
    `;
}

window.addRanking = function() {
    const container = document.getElementById("rankings-container");
    const currentItems = Array.from(container.children).map((_, index) => ({ rank: '', known_above_rank: '', date_noted: '', citationId: '' }));
    currentItems.push({ rank: '', known_above_rank: '', date_noted: '', citationId: '' });
    renderSubItemsWithCitations(currentItems, "rankings-container", renderRanking);
};

window.addStat = function() {
    const container = document.getElementById("stats-container");
    const currentItems = Array.from(container.children).map((_, index) => ({ 
        date_noted: '', scan_type: '', sp: '', hp: '', mp: '', str: '', vit: '', int: '', agi: '', dex: '', luc: '', stat_total: '', points_from_average: '', date_sequence: '', citationId: '' 
    }));
    currentItems.push({ 
        date_noted: '', scan_type: '', sp: '', hp: '', mp: '', str: '', vit: '', int: '', agi: '', dex: '', luc: '', stat_total: '', points_from_average: '', date_sequence: '', citationId: '' 
    });
    renderSubItemsWithCitations(currentItems, "stats-container", renderStat);
};

window.addOrbUsed = function() {
    const container = document.getElementById("orbs-used-container");
    const currentItems = Array.from(container.children).map((_, index) => ({ orb_id: '', date_acquired: '', date_note: '', citationId: '' }));
    currentItems.push({ orb_id: '', date_acquired: '', date_note: '', citationId: '' });
    renderSubItemsWithCitations(currentItems, "orbs-used-container", renderOrbUsed);
};

window.addDropRate = function() {
    const container = document.getElementById("drop-rates-container");
    const currentItems = Array.from(container.children).map((_, index) => ({ creature: '', dungeon: '', probability: '', citationId: '' }));
    currentItems.push({ creature: '', dungeon: '', probability: '', citationId: '' });
    renderSubItemsWithCitations(currentItems, "drop-rates-container", renderDropRate);
};

window.removeSubItem = function(field, index) {
    const container = document.getElementById(`${field}-container`);
    const currentItems = Array.from(container.children).map((_, i) => {
        const inputs = container.querySelectorAll(`[name^="${field}[${i}]"]`);
        const item = {};
        inputs.forEach(input => {
            const match = input.name.match(/\[(\d+)\]\[(.*?)\]/);
            if (match) {
                const key = match[2];
                item[key] = input.value;
                if (['rank', 'known_above_rank', 'str', 'vit', 'int', 'agi', 'dex', 'luc', 'stat_total', 'points_from_average'].includes(key)) item[key] = parseInt(input.value) || null;
                if (['sp', 'hp', 'mp', 'probability'].includes(key)) item[key] = parseFloat(input.value) || null;
            }
        });
        return item;
    });
    currentItems.splice(index, 1);
    renderSubItemsWithCitations(currentItems, `${field}-container`, field === 'rankings' ? renderRanking : field === 'stats' ? renderStat : field === 'orbs_used' ? renderOrbUsed : renderDropRate);
};

function addModalButtons(form) {
    form.innerHTML += `
        <button type="button" onclick="import('/authHelper.js').then(module => module.saveEdit())">Save</button>
        <button type="button" onclick="document.getElementById('edit-modal').style.display = 'none'">Cancel</button>
    `;
    const closeBtn = document.querySelector("#edit-modal .close");
    closeBtn.onclick = () => document.getElementById("edit-modal").style.display = "none";
}

// Utility to clean undefined values from an object recursively
function cleanUndefined(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
        return obj.map(cleanUndefined).filter(item => item !== null);
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = cleanUndefined(obj[key]);
            if (value !== undefined) {
                cleaned[key] = value;
            }
        }
        return Object.keys(cleaned).length ? cleaned : null;
    }
    return obj;
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
                date_first_known: form.date_first_known.value ? new Date(form.date_first_known.value).toISOString() : null,
                rankings: [],
                stats: [],
                orbs_used: []
            };

            const rankingInputs = form.querySelectorAll('[name^="rankings"]');
            let currentIndex = -1;
            let currentRanking = {};
            rankingInputs.forEach(input => {
                const match = input.name.match(/rankings\[(\d+)\]\[(.*?)\](?:\[([^\]]*)\])?/);
                if (match) {
                    const index = parseInt(match[1]);
                    const key = match[2];
                    const subKey = match[3];
                    if (index !== currentIndex) {
                        if (currentIndex !== -1 && Object.keys(currentRanking).length) {
                            console.log(`Saving ranking[${currentIndex}] with citationData:`, currentRanking.citationData);
                            updates.rankings.push(cleanUndefined({ ...currentRanking, citation: undefined }));
                            saveCitation(currentRanking.citationData || {}, currentCollection, currentDocId, currentRanking.citationId);
                        }
                        currentIndex = index;
                        currentRanking = { citationId: crypto.randomUUID(), citationData: {} };
                    }
                    if (key === 'rank' || key === 'known_above_rank') {
                        currentRanking[key] = input.value ? parseInt(input.value) : null;
                    } else if (key === 'date_noted') {
                        currentRanking[key] = input.value || null;
                    } else if (key === 'citation' && subKey) {
                        currentRanking.citationData[subKey] = input.value !== undefined ? (input.value || null) : null;
                    }
                }
            });
            if (Object.keys(currentRanking).length) {
                console.log(`Saving ranking[${currentIndex}] with citationData:`, currentRanking.citationData);
                updates.rankings.push(cleanUndefined({ ...currentRanking, citation: undefined }));
                saveCitation(currentRanking.citationData || {}, currentCollection, currentDocId, currentRanking.citationId);
            }

            const statInputs = form.querySelectorAll('[name^="stats"]');
            currentIndex = -1;
            let currentStat = {};
            statInputs.forEach(input => {
                const match = input.name.match(/stats\[(\d+)\]\[(.*?)\](?:\[([^\]]*)\])?/);
                if (match) {
                    const index = parseInt(match[1]);
                    const key = match[2];
                    const subKey = match[3];
                    if (index !== currentIndex) {
                        if (currentIndex !== -1 && Object.keys(currentStat).length) {
                            console.log(`Saving stat[${currentIndex}] with citationData:`, currentStat.citationData);
                            updates.stats.push(cleanUndefined({ ...currentStat, citation: undefined }));
                            saveCitation(currentStat.citationData || {}, currentCollection, currentDocId, currentStat.citationId);
                        }
                        currentIndex = index;
                        currentStat = { citationId: crypto.randomUUID(), citationData: {} };
                    }
                    if (key === 'date_noted' || key === 'scan_type' || key === 'date_sequence') {
                        currentStat[key] = input.value || null;
                    } else if (['sp', 'hp', 'mp'].includes(key)) {
                        currentStat[key] = input.value ? parseFloat(input.value) : null;
                    } else if (['str', 'vit', 'int', 'agi', 'dex', 'luc', 'stat_total', 'points_from_average'].includes(key)) {
                        currentStat[key] = input.value ? parseInt(input.value) : null;
                    } else if (key === 'citation' && subKey) {
                        currentStat.citationData[subKey] = input.value !== undefined ? (input.value || null) : null;
                    }
                }
            });
            if (Object.keys(currentStat).length) {
                console.log(`Saving stat[${currentIndex}] with citationData:`, currentStat.citationData);
                updates.stats.push(cleanUndefined({ ...currentStat, citation: undefined }));
                saveCitation(currentStat.citationData || {}, currentCollection, currentDocId, currentStat.citationId);
            }

            const orbUsedInputs = form.querySelectorAll('[name^="orbs_used"]');
            currentIndex = -1;
            let currentOrbUsed = {};
            orbUsedInputs.forEach(input => {
                const match = input.name.match(/orbs_used\[(\d+)\]\[(.*?)\](?:\[([^\]]*)\])?/);
                if (match) {
                    const index = parseInt(match[1]);
                    const key = match[2];
                    const subKey = match[3];
                    if (index !== currentIndex) {
                        if (currentIndex !== -1 && Object.keys(currentOrbUsed).length) {
                            console.log(`Saving orb_used[${currentIndex}] with citationData:`, currentOrbUsed.citationData);
                            updates.orbs_used.push(cleanUndefined({ ...currentOrbUsed, citation: undefined }));
                            saveCitation(currentOrbUsed.citationData || {}, currentCollection, currentDocId, currentOrbUsed.citationId);
                        }
                        currentIndex = index;
                        currentOrbUsed = { citationId: crypto.randomUUID(), citationData: {} };
                    }
                    if (key === 'orb_id' || key === 'date_acquired' || key === 'date_note') {
                        currentOrbUsed[key] = input.value || null;
                    } else if (key === 'citation' && subKey) {
                        currentOrbUsed.citationData[subKey] = input.value !== undefined ? (input.value || null) : null;
                    }
                }
            });
            if (Object.keys(currentOrbUsed).length) {
                console.log(`Saving orb_used[${currentIndex}] with citationData:`, currentOrbUsed.citationData);
                updates.orbs_used.push(cleanUndefined({ ...currentOrbUsed, citation: undefined }));
                saveCitation(currentOrbUsed.citationData || {}, currentCollection, currentDocId, currentOrbUsed.citationId);
            }

        } else if (currentCollection === "orb") {
            updates = {
                orb_name: form.orb_name.value || null,
                known_effects: form.known_effects.value || null,
                note: form.note.value || null,
                drop_rates: []
            };

            const dropRateInputs = form.querySelectorAll('[name^="drop_rates"]');
            currentIndex = -1;
            let currentDropRate = {};
            dropRateInputs.forEach(input => {
                const match = input.name.match(/drop_rates\[(\d+)\]\[(.*?)\](?:\[([^\]]*)\])?/);
                if (match) {
                    const index = parseInt(match[1]);
                    const key = match[2];
                    const subKey = match[3];
                    if (index !== currentIndex) {
                        if (currentIndex !== -1 && Object.keys(currentDropRate).length) {
                            console.log(`Saving drop_rate[${currentIndex}] with citationData:`, currentDropRate.citationData);
                            updates.drop_rates.push(cleanUndefined({ ...currentDropRate, citation: undefined }));
                            saveCitation(currentDropRate.citationData || {}, currentCollection, currentDocId, currentDropRate.citationId);
                        }
                        currentIndex = index;
                        currentDropRate = { citationId: crypto.randomUUID(), citationData: {} };
                    }
                    if (key === 'creature' || key === 'dungeon') {
                        currentDropRate[key] = input.value || null;
                    } else if (key === 'probability') {
                        currentDropRate[key] = input.value ? parseFloat(input.value) : null;
                    } else if (key === 'citation' && subKey) {
                        currentDropRate.citationData[subKey] = input.value !== undefined ? (input.value || null) : null;
                    }
                }
            });
            if (Object.keys(currentDropRate).length) {
                console.log(`Saving drop_rate[${currentIndex}] with citationData:`, currentDropRate.citationData);
                updates.drop_rates.push(cleanUndefined({ ...currentDropRate, citation: undefined }));
                saveCitation(currentDropRate.citationData || {}, currentCollection, currentDocId, currentDropRate.citationId);
            }
        }

        // Clean up empty arrays and remove undefined values
        ['rankings', 'stats', 'orbs_used', 'drop_rates'].forEach(field => {
            if (updates[field]) {
                updates[field] = updates[field].filter(item => {
                    return item && Object.values(item).some(val => val !== null && val !== '' && val !== undefined);
                });
            }
        });

        // Final cleanup of undefined values
        updates = cleanUndefined(updates);

        // Log the updates object to debug
        console.log("Updates object before save:", JSON.stringify(updates, null, 2));

        const docRef = doc(db, currentCollection, currentDocId);
        await updateDoc(docRef, updates);
        modal.style.display = "none";
        console.log(`${currentCollection} ${currentDocId} updated successfully`);
        window.location.reload();
    } catch (error) {
        console.error("Error saving edit:", error);
        alert("Failed to save changes. Check console for details.");
    }
}

function saveCitation(citationData, collection, docId, citationId) {
    console.log(`Saving citation for ${collection}/${docId}/citations/${citationId}:`, citationData);
    const cleanedCitationData = cleanUndefined({
        chapter: citationData.chapter !== undefined ? citationData.chapter || null : null,
        jnc_part: citationData.jnc_part !== undefined ? citationData.jnc_part || null : null,
        volume: citationData.volume !== undefined ? citationData.volume || null : null
    });
    const citationRef = doc(db, `${collection}/${docId}/citations`, citationId);
    setDoc(citationRef, cleanedCitationData || { chapter: null, jnc_part: null, volume: null }, { merge: true }).catch(error => console.error("Error saving citation:", error));
}