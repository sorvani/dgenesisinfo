// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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

// 🔹 Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    return querySnapshot.docs.map(doc => doc.data());
}

// 🔹 Process Orb Data
function processOrbData(orbData) {
    // possibly move orb sort here?
    populateOrbTable(orbData);
}
// 🔹 Populate Table with Firestore Data
function populateOrbTable(orbData) {
    const tbody = document.querySelector("#orb-table tbody");
    tbody.innerHTML = ""; // Clear previous data

    // Sort orbs by orb_name alphabetically
    const sortedOrbs = orbData.sort((a, b) => {
        const nameA = a.orb_name.toLowerCase();
        const nameB = b.orb_name.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Populate the table with orb data (only orb_name, no orb_id)
    sortedOrbs.forEach(orb => {
        const row = document.createElement("tr");
        const orbID = orb.orb_id || 0;
        row.dataset.id = `${orbID}`;

        const orbName = orb.orb_name || 'Unknown';
        const knownEffects = orb.known_effects || 'Not documented';
        // Main orb row (clickable to show drop monsters)
        row.innerHTML = `<td data-label="Orb Name">${orbName}</td>
                        <td data-label="Known Effects">${knownEffects}</td>`;

        // Add click event to toggle drop monsters
        row.addEventListener('click', () => toggleOrbDetails(orb, row));

        tbody.appendChild(row);
    });
}

// Function to toggle the drop monster details for each orb
function toggleOrbDetails(orb, row) {
    let detailsRow = row.nextElementSibling;

    // Check if subtable already exists
    if (detailsRow && detailsRow.classList.contains('orb-details-row')) {
        detailsRow.remove();  // Remove the subtable if it already exists (toggle off)
    } else {
        // Create new row for the orb details (drop monsters)
        detailsRow = document.createElement("tr");
        detailsRow.classList.add('orb-details-row');
        const detailsCell = document.createElement("td");
        detailsCell.setAttribute('colspan', '2');

        let detailsContent = '';

        // If drop_rates exist, display them as a table
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

            orb.drop_rates.forEach(rate => {
                const dropCreature = rate.creature !== null ? rate.creature : 'Unknown Monster';
                // Set dungeon and floor to 'Unknown' if they are null or undefined
                const dropDungeon = rate.dungeon != null ? rate.dungeon : 'Unknown';
                const dropFloor = rate.floor != null ? rate.floor : 'Unknown';
                // handle null probability info and format numbers with commas
                const favorableOutcomes = rate.favorable_outcomes !== null ? rate.favorable_outcomes.toLocaleString() : 0;
                const totalEvents = rate.total_events !== null ? rate.total_events.toLocaleString(): 0;
                let probability, cooldownDisplay;
                if (favorableOutcomes === 0 || totalEvents === 0) {
                    probability = 'Unknown Rate';
                    cooldownDisplay = '';
                } else {
                    probability = `${favorableOutcomes} / ${totalEvents}`;
                    const cooldownDays = (rate.total_events/100000000);
                    // Check if cooldown is greater than or equal to 1 day
                    if (cooldownDays >= 1) {
                        cooldownDisplay = `${cooldownDays.toLocaleString()} day(s)`;
                    } 
                    // If less than 1 day, display in hours
                    else if (cooldownDays >= (1 / 24)) {
                        cooldownDisplay = `${(cooldownDays * 24).toLocaleString()} hour(s)`;
                    } 
                    // If less than 1 hour, display in minutes
                    else if (cooldownDays >= (1 / 1440)) {
                        cooldownDisplay = `${(cooldownDays * 1440).toLocaleString()} minute(s)`; // 1 day = 1440 minutes
                    } 
                    // If less than 1 minute, display in seconds
                    else {
                        cooldownDisplay = `${(cooldownDays * 86400).toLocaleString()} second(s)`; // 1 day = 86400 seconds
                    }
                }
                detailsContent += `<tr>
                    <td data-label="Dropped By">${dropCreature}</td>
                    <td data-label="In Dungeon">${dropDungeon}</td>
                    <td data-label="On Floor">${dropFloor}</td>
                    <td data-label="Probability">${probability}</td>
                    <td data-label="Cooldown">${cooldownDisplay}</td>`;
                // Check if there's a citation array and add it to the stat row
                if (rate.citation && rate.citation.length > 0) {
                    // Loop through citations and display them. normally there is only one, but more could be possible so used loop
                    rate.citation.forEach(cite => {
                        detailsContent += `<td data-label="Citation">Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part: ${cite.jnc_part !== null ? cite.jnc_part : ''}</td>`;
                    });
                } else {
                    detailsContent += `<td data-label="Citation">Missing</td>`;
                }
                detailsContent += `</tr>`;
            });

            detailsContent += '</tbody></table>';
        } else {
            detailsContent = '<em>No known drop rates</em>';
        }

        // Check if there is a note for the orb and append it
        if (orb.note) {
            detailsContent += `<div class="details-note"><strong>Note:</strong> ${orb.note}</div>`;
        }

        detailsCell.innerHTML = detailsContent;
        detailsRow.appendChild(detailsCell);
        row.after(detailsRow);  // Insert the details after the clicked row
    }
}

document.addEventListener("dataUpdated", async (event) => {
    if (event.detail.collection === "orb") {
        console.log("Orb data updated. Reloading table...");

        // Fetch fresh data
        const orbData = await fetchFirestoreData("orb");
        console.log("Updated Orb Data:", orbData);

        // Call processorbData() only after orbData is updated
        processOrbData(orbData);
    }
});
