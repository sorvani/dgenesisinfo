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

// 🔹 Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    if (document.querySelector("#explorer-table")) {
        try {
            console.log("Fetching explorer data...");
            const explorerData = await fetchFirestoreData("explorer");
            const orbData = await fetchFirestoreData("orb");

            processExplorerData(explorerData, orbData);
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

// 🔹 Process Explorer Data
function processExplorerData(explorerData, orbData) {
    // Extract the latest rank from rankings array
    const explorersWithRanks = explorerData.map(explorer => {
        if (explorer.rankings && explorer.rankings.length > 0) {
            const latestRanking = explorer.rankings.sort((a, b) => toUnixTimestamp(b.date_noted) - toUnixTimestamp(a.date_noted))[0];
            explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank : null;

            // Handle "Above Rank" cases
            if (explorer.latest_rank === null && latestRanking.known_above_rank) {
                explorer.latest_rank = `Above ${latestRanking.known_above_rank.toLocaleString()}`;
                explorer.rank_value_for_sort = latestRanking.known_above_rank - 1;
            } else {
                explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank.toLocaleString() : 'Unknown';
                explorer.rank_value_for_sort = latestRanking.rank !== 0 ? latestRanking.rank : Infinity;
            }

            // Handle citations
            explorer.rank_citation = formatCitation(latestRanking.citation);
        } else {
            explorer.latest_rank = null;
            explorer.rank_citation = null;
            explorer.rank_value_for_sort = Infinity;
        }
        return explorer;
    });

    // Sort Explorers by Rank
    explorersWithRanks.sort((a, b) => a.rank_value_for_sort - b.rank_value_for_sort);

    populateExplorerTable(explorersWithRanks, orbData);
}

// 🔹 Populate Table with Firestore Data
function populateExplorerTable(explorers, orbData) {
    const tbody = document.querySelector("#explorer-table tbody");
    tbody.innerHTML = ""; // Clear previous data

    explorers.forEach(explorer => {
        const row = document.createElement("tr");

        // Replace nulls with empty strings
        const firstName = explorer.first_name || '';
        const lastName = explorer.last_name || '';
        const moniker = explorer.moniker || '';
        const nationality = explorer.nationality || '';
        const dateFirstKnown = formatDate(explorer.date_first_known);
        const latestRank = explorer.latest_rank !== null ? explorer.latest_rank : 'Unknown';
        const nameKnown = explorer.public === 1 ? '&#10004;' : '';
        const rankCitation = explorer.rank_citation !== null ? explorer.rank_citation : 'Missing';

        row.innerHTML = `<td data-label="Rank">${latestRank}</td>
                         <td data-label="Name">${firstName} ${lastName}</td>
                         <td data-label="Name is Public">${nameKnown}</td>
                         <td data-label="Moniker">${moniker}</td>
                         <td data-label="Nationality">${nationality}</td>
                         <td data-label="Date First Known">${dateFirstKnown}</td>
                         <td data-label="Rank Citation">${rankCitation}</td>`;

        row.addEventListener('click', () => toggleOrbsAndStats(explorer, orbData, row));

        tbody.appendChild(row);
    });
}

// 🔹 Function to Toggle Orbs & Stats
function toggleOrbsAndStats(explorer, orbData, row) {
    let nextRow = row.nextElementSibling;

    if (nextRow && nextRow.classList.contains('orb-details-row')) {
        nextRow.remove();
    } else {
        const orbsRow = document.createElement("tr");
        orbsRow.classList.add('orb-details-row');
        const orbsCell = document.createElement("td");
        orbsCell.setAttribute('colspan', '7');

        let orbsContent = '<div class="details-section"><h3>Orbs Used</h3>';
        if (explorer.orbs_used && explorer.orbs_used.length > 0) {
            orbsContent += `<table class="details-table"><thead><tr>
                <th>Orb Name</th><th>Date Acquired</th><th>Note</th><th>Citation</th>
                </tr></thead><tbody>`;

            explorer.orbs_used.forEach(orbUsed => {
                const orbInfo = orbData.find(orb => orb.orb_id === orbUsed.orb_id);
                const orbName = orbInfo ? orbInfo.orb_name : 'Unknown Orb';
                const dateAcquired = formatDate(orbUsed.date_acquired);
                const dateNote = orbUsed.date_note || '';
                const citation = formatCitation(orbUsed.citation);

                orbsContent += `<tr>
                    <td>${orbName}</td>
                    <td>${dateAcquired}</td>
                    <td>${dateNote}</td>
                    <td>${citation}</td>
                </tr>`;
            });

            orbsContent += '</tbody></table></div>';
        } else {
            orbsContent += '<em>No orbs known to have been used</em></div>';
        }

        orbsCell.innerHTML = orbsContent;
        orbsRow.appendChild(orbsCell);
        row.after(orbsRow);
    }
}

// 🔹 Helper: Format Date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
}

// 🔹 Helper: Convert to Unix Timestamp
function toUnixTimestamp(dateNoted) {
    if (typeof dateNoted === 'number') return dateNoted;
    const parsedDate = new Date(dateNoted);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.getTime();
}

// 🔹 Helper: Format Citation
function formatCitation(citations) {
    if (!citations || citations.length === 0) return 'Missing';
    return citations.map(cite => `Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part:${cite.jnc_part || ''}`).join("<br />");
}
