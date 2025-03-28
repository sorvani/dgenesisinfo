// Import Firebase modules
import { firebaseApp } from "./firebase-config.js";
import { checkUserCanEdit, updateEditColumnVisibility, initializeEditButtons } from "./authHelper.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Initialize Firebase & Firestore
const db = getFirestore(firebaseApp);

document.addEventListener("DOMContentLoaded", async () => {
    if (document.querySelector("#orb-table")) {
        try {
            console.log("Fetching orb data...");
            const orbData = await fetchFirestoreData("orb");

            processOrbData(orbData);
        } catch (error) {
            console.error("Error fetching Firestore data:", error);
        }
    }
});

// 🔹 Fetch Data from Firestore Collection
async function fetchFirestoreData(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const docs = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    console.log(`Fetched ${docs.length} documents from ${collectionName}:`, docs.slice(0, 3));
    return docs;
}

// 🔹 Validate Citation ID (check if it's a UUID)
function isValidCitationId(citationId) {
    if (typeof citationId !== 'string') return false;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(citationId) || citationId === 'auto-id'; // Allow 'auto-id' for auto-generated IDs
}

// 🔹 Fetch Citation Data from Subcollection
async function getCitationData(docId, citationId) {
    try {
        const citationRef = doc(db, `orb/${docId}/citations`, citationId);
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

// 🔹 Format Citation
function formatCitation(citation) {
    if (!citation || typeof citation !== 'object') return 'Missing';
    return `Vol:${citation.volume || ''} Ch:${citation.chapter || ''} JNC Part:${citation.jnc_part || ''}`;
}

// 🔹 Process Orb Data
function processOrbData(orbData) {
    populateOrbTable(orbData);
}

// 🔹 Populate Table with Firestore Data
function populateOrbTable(orbData) {
    const tbody = document.querySelector("#orb-table tbody");
    tbody.innerHTML = "";

    const sortedOrbs = orbData.sort((a, b) => {
        const nameA = a.orb_name.toLowerCase();
        const nameB = b.orb_name.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedOrbs.forEach(orb => {
        const row = document.createElement("tr");
        const orbDocId = orb.docId; // Use Firestore doc ID
        console.log(`Orb docId: ${orbDocId}, internal orb_id: ${orb.orb_id}`);
        row.dataset.id = `${orbDocId}`;

        const orbName = orb.orb_name || 'Unknown';
        const knownEffects = orb.known_effects || 'Not documented';

        row.innerHTML = `
            <td class="edit-section"><button data-doc-id="${orbDocId}" class="edit-icon">🖊</button></td>
            <td data-label="Orb Name">${orbName}</td>
            <td data-label="Known Effects">${knownEffects}</td>
        `;

        row.addEventListener('click', () => toggleOrbDetails(orb, row));

        tbody.appendChild(row);
    });
}

// Function to toggle the drop monster details for each orb
async function toggleOrbDetails(orb, row) {
    let detailsRow = row.nextElementSibling;

    if (detailsRow && detailsRow.classList.contains('orb-details-row')) {
        detailsRow.remove();
    } else {
        detailsRow = document.createElement("tr");
        detailsRow.classList.add('orb-details-row');
        const detailsCell = document.createElement("td");
        detailsCell.setAttribute('colspan', '3');

        let detailsContent = '';

        if (orb.drop_rates && orb.drop_rates.length > 0) {
            detailsContent += `<table class="details-table">
                <thead>
                    <tr>
                        <th>Dropped By</th>
                        <th>In Dungeon</th>
                        <th>On Floor</th>
                        <th>Probability</th>
                        <th>Cooldown</th>
                        <th>Citation</th>
                    </tr>
                </thead>
                <tbody>`;

            for (const rate of orb.drop_rates) {
                const dropCreature = rate.creature !== null ? rate.creature : 'Unknown Monster';
                const dropDungeon = rate.dungeon != null ? rate.dungeon : 'Unknown';
                const dropFloor = rate.floor != null ? rate.floor : 'Unknown';
                const favorableOutcomes = rate.favorable_outcomes !== null ? rate.favorable_outcomes.toLocaleString() : 0;
                const totalEvents = rate.total_events !== null ? rate.total_events.toLocaleString() : 0;
                let probability, cooldownDisplay;
                if (favorableOutcomes === 0 || totalEvents === 0) {
                    probability = 'Unknown Rate';
                    cooldownDisplay = '';
                } else {
                    probability = `${favorableOutcomes} / ${totalEvents}`;
                    const cooldownDays = (rate.total_events / 100000000);
                    if (cooldownDays >= 1) {
                        cooldownDisplay = `${cooldownDays.toLocaleString()} day(s)`;
                    } else if (cooldownDays >= (1 / 24)) {
                        cooldownDisplay = `${(cooldownDays * 24).toLocaleString()} hour(s)`;
                    } else if (cooldownDays >= (1 / 1440)) {
                        cooldownDisplay = `${(cooldownDays * 1440).toLocaleString()} minute(s)`;
                    } else {
                        cooldownDisplay = `${(cooldownDays * 86400).toLocaleString()} second(s)`;
                    }
                }

                detailsContent += `<tr>
                    <td data-label="Dropped By">${dropCreature}</td>
                    <td data-label="In Dungeon">${dropDungeon}</td>
                    <td data-label="On Floor">${dropFloor}</td>
                    <td data-label="Probability">${probability}</td>
                    <td data-label="Cooldown">${cooldownDisplay}</td>`;

                // Handle citation using citationId
                const citationId = rate.citationId;
                const citation = citationId && isValidCitationId(citationId)
                    ? formatCitation(await getCitationData(orb.docId, citationId))
                    : 'Missing';
                detailsContent += `<td data-label="Citation">${citation}</td>`;
                detailsContent += `</tr>`;
            }

            detailsContent += '</tbody></table>';
        } else {
            detailsContent = '<em>No known drop rates</em>';
        }

        if (orb.note) {
            detailsContent += `<div class="details-note"><strong>Note:</strong> ${orb.note}</div>`;
        }

        detailsCell.innerHTML = detailsContent;
        detailsRow.appendChild(detailsCell);
        row.after(detailsRow);
    }
}

async function updateOrbTable() {
    const canEdit = await checkUserCanEdit();
    console.log("Updating orb table...");
    updateEditColumnVisibility(canEdit);
}

document.addEventListener("DOMContentLoaded", () => {
    updateOrbTable();
});