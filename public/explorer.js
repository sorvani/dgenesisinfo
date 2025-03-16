// Import Firebase modules
import { firebaseApp } from "./firebase-config.js";
import { checkUserCanEdit, updateEditColumnVisibility, initializeEditButtons } from "./authHelper.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Initialize Firebase & Firestore
const db = getFirestore(firebaseApp);

document.addEventListener("DOMContentLoaded", async () => {
    if (document.querySelector("#explorer-table")) {
        try {
            console.log("Fetching explorer data...");
            const explorerData = await fetchFirestoreData("explorer");
            const orbData = await fetchFirestoreData("orb");

            await processExplorerData(explorerData, orbData);
        } catch (error) {
            console.error("Error fetching Firestore data:", error);
        }
    }
});

// 🔹 Fetch Data from Firestore Collection
async function fetchFirestoreData(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const docs = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    console.log(`Fetched ${docs.length} documents from ${collectionName}:`, docs.slice(0, 3)); // Log first 3 for debugging
    return docs;
}

// 🔹 Process Explorer Data
async function processExplorerData(explorerData, orbData) {
    const explorersWithRanks = await Promise.all(explorerData.map(async (explorer) => {
        if (explorer.rankings && explorer.rankings.length > 0) {
            const latestRanking = explorer.rankings.sort((a, b) => toUnixTimestamp(b.date_noted) - toUnixTimestamp(a.date_noted))[0];
            explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank : null;

            if (explorer.latest_rank === null && latestRanking.known_above_rank) {
                explorer.latest_rank = `Above ${latestRanking.known_above_rank.toLocaleString()}`;
                explorer.rank_value_for_sort = latestRanking.known_above_rank - 1;
            } else {
                explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank.toLocaleString() : 'Unknown';
                explorer.rank_value_for_sort = latestRanking.rank !== 0 ? latestRanking.rank : Infinity;
            }

            // Fetch citation data using citationId
            const citationId = latestRanking.citationId;
            if (citationId && isValidCitationId(citationId)) {
                const citationDoc = await getCitationData(explorer.docId, citationId);
                explorer.rank_citation = formatCitation(citationDoc);
            } else {
                explorer.rank_citation = 'Missing';
            }
        } else {
            explorer.latest_rank = null;
            explorer.rank_citation = null;
            explorer.rank_value_for_sort = Infinity;
        }
        return explorer;
    }));

    explorersWithRanks.sort((a, b) => a.rank_value_for_sort - b.rank_value_for_sort);

    populateExplorerTable(explorersWithRanks, orbData);
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
        const citationRef = doc(db, `explorer/${docId}/citations`, citationId);
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

// 🔹 Populate Table with Firestore Data
function populateExplorerTable(explorers, orbData) {
    const tbody = document.querySelector("#explorer-table tbody");
    tbody.innerHTML = "";

    explorers.forEach(explorer => {
        const row = document.createElement("tr");
        const explorerDocId = explorer.docId;
        console.log(`Explorer docId: ${explorerDocId}, internal id: ${explorer.id}`);
        row.dataset.id = `${explorerDocId}`;

        const firstName = explorer.first_name || '';
        const lastName = explorer.last_name || '';
        const moniker = explorer.moniker || '';
        const nationality = explorer.nationality || '';
        const dateFirstKnown = formatDate(explorer.date_first_known);
        const latestRank = explorer.latest_rank !== null ? explorer.latest_rank : 'Unknown';
        const nameKnown = explorer.public === 1 ? '✔' : '';
        const rankCitation = explorer.rank_citation || 'Missing';

        row.innerHTML = `<td class="edit-section"><button data-doc-id="${explorerDocId}" class="edit-icon">🖊</button></td>
                         <td data-label="Rank">${latestRank}</td>
                         <td data-label="Name">${firstName} ${lastName}</td>
                         <td data-label="Name is Public">${nameKnown}</td>
                         <td data-label="Moniker">${moniker}</td>
                         <td data-label="Nationality">${nationality}</td>
                         <td data-label="Date First Known">${dateFirstKnown}</td>
                         <td data-label="Rank Citation">${rankCitation}</td>`;

        row.addEventListener('click', async () => {
            try {
                await toggleOrbsAndStats(explorer, orbData, row);
            } catch (error) {
                console.error("Error toggling orbs and stats:", error);
            }
        });

        tbody.appendChild(row);
    });
}

// 🔹 Function to Toggle Orbs & Stats
async function toggleOrbsAndStats(explorer, orbData, row) {
    let nextRow = row.nextElementSibling;

    if (nextRow && nextRow.classList.contains('orb-details-row')) {
        nextRow.remove();
        nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('rankings-row')) nextRow.remove();
        nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('stat-details-row')) nextRow.remove();
    } else {
        const orbsRow = document.createElement("tr");
        orbsRow.classList.add('orb-details-row');
        const orbsCell = document.createElement("td");
        orbsCell.setAttribute('colspan', '8');

        let orbsContent = '<div class="details-section"><h3>Orbs Used</h3>';
        if (explorer.orbs_used && explorer.orbs_used.length > 0) {
            orbsContent += `<table class="details-table"><thead><tr>
                <th>Orb Name</th><th>Date Acquired</th><th>Note</th><th>Citation</th>
                </tr></thead><tbody>`;

            for (const orbUsed of explorer.orbs_used) {
                const orbInfo = orbData.find(orb => orb.orb_id === orbUsed.orb_id);
                const orbName = orbInfo ? orbInfo.orb_name : 'Unknown Orb';
                const dateAcquired = formatDate(orbUsed.date_acquired);
                const dateNote = orbUsed.date_note || '';
                const citationId = orbUsed.citationId;
                const citation = citationId && isValidCitationId(citationId)
                    ? formatCitation(await getCitationData(explorer.docId, citationId))
                    : 'Missing';

                orbsContent += `<tr>
                    <td data-label="Orb Name" class="orb-name" data-orb-id="${orbUsed.orb_id}">${orbName}</td>
                    <td data-label="Date Acquired">${dateAcquired}</td>
                    <td data-label="Note">${dateNote}</td>
                    <td data-label="Citation">${citation}</td>
                </tr>`;
            }

            orbsContent += '</tbody></table></div>';
        } else {
            orbsContent += '<em>No orbs known to have been used</em></div>';
        }

        orbsCell.innerHTML = orbsContent;
        orbsRow.appendChild(orbsCell);
        row.after(orbsRow);
        
        addOrbHoverDetails();

        const rankingsRow = document.createElement("tr");
        rankingsRow.classList.add('rankings-row');
        const rankingsCell = document.createElement("td");
        rankingsCell.setAttribute('colspan', '8');

        let rankingsContent = '<div class="details-section"><h3>Rankings Over Time</h3>';
        if (explorer.rankings && explorer.rankings.length > 0) {
            rankingsContent += `<table class="details-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Known Above Rank</th>
                        <th>Date Noted</th>
                        <th>Citation</th>
                    </tr>
                </thead><tbody>`;

            for (const ranking of explorer.rankings) {
                const dateNoted = formatDate(ranking.date_noted);
                const rank = ranking.rank !== 0 ? ranking.rank.toLocaleString() : 'Unknown';
                const knownAbove = ranking.known_above_rank ? `Above ${ranking.known_above_rank.toLocaleString()}` : '';
                const citationId = ranking.citationId;
                const citation = citationId && isValidCitationId(citationId)
                    ? formatCitation(await getCitationData(explorer.docId, citationId))
                    : 'Missing';

                rankingsContent += `<tr>
                    <td data-label="Rank">${rank}</td>
                    <td data-label="Known Above Rank">${knownAbove}</td>
                    <td data-label="Date Noted">${dateNoted}</td>
                    <td data-label="Citation">${citation}</td>
                </tr>`;
            }

            rankingsContent += '</tbody></table></div>';
        } else {
            rankingsContent += '<em>No ranking history available</em></div>';
        }

        rankingsCell.innerHTML = rankingsContent;
        rankingsRow.appendChild(rankingsCell);
        orbsRow.after(rankingsRow);

        const statsRow = document.createElement("tr");
        statsRow.classList.add('stat-details-row');
        const statsCell = document.createElement("td");
        statsCell.setAttribute('colspan', '8');

        let statsContent = '<div class="details-section"><h3>Explorer Stats</h3>';
        if (explorer.stats && explorer.stats.length > 0) {
            statsContent += `<table class="details-table"><thead>
                <tr>
                    <th>Reading Date</th>
                    <th>Scan Type</th>
                    <th>SP</th>
                    <th>HP</th>
                    <th>MP</th>
                    <th>STR</th>
                    <th>VIT</th>
                    <th>INT</th>
                    <th>AGI</th>
                    <th>DEX</th>
                    <th>LUC</th>
                    <th>Stat Total</th>
                    <th>Deviation</th>
                    <th>Citation</th>
                </tr></thead><tbody>`;

            for (const stat of explorer.stats) {
                statsContent += `<tr>
                    <td data-label="Reading Date">${formatDate(stat.date_noted)} - ${stat.date_sequence}</td>
                    <td data-label="Scan Type">${stat.scan_type}</td>
                    <td data-label="SP">${stat.sp !== null ? stat.sp : ''}</td>
                    <td data-label="HP">${stat.hp.toFixed(2)}</td>
                    <td data-label="MP">${stat.mp.toFixed(2)}</td>
                    <td data-label="STR">${stat.str}</td>
                    <td data-label="VIT">${stat.vit}</td>
                    <td data-label="INT">${stat.int}</td>
                    <td data-label="AGI">${stat.agi}</td>
                    <td data-label="DEX">${stat.dex}</td>
                    <td data-label="LUC">${stat.luc}</td>
                    <td data-label="Stat Total">${stat.stat_total}</td>
                    <td data-label="Deviation">${stat.points_from_average}</td>`;

                const citationId = stat.citationId;
                const citation = citationId && isValidCitationId(citationId)
                    ? formatCitation(await getCitationData(explorer.docId, citationId))
                    : 'Missing';
                statsContent += `<td data-label="Citation">${citation}</td></tr>`;
            }

            statsContent += '</tbody></table></div>';
        } else {
            statsContent += '<em>No stats available</em></div>';
        }

        statsCell.innerHTML = statsContent;
        statsRow.appendChild(statsCell);
        rankingsRow.after(statsRow);
    }
}

// 🔹 Add mouseover event to show orb details
function addOrbHoverDetails() {
    document.querySelectorAll(".orb-name").forEach(orbElement => {
        orbElement.addEventListener("mouseover", async (event) => {
            const orbId = event.target.getAttribute("data-orb-id");
            if (!orbId) return;

            const orbData = await fetchFirestoreData("orb");
            let orbInfo = orbData.find(orb => orb.orb_id == orbId);
            if (!orbInfo) {
                console.log(`Orb ID ${orbId} lookup failed, setting orbInfo to unknowns.`);
                orbInfo = {
                    orb_name: "Unknown Orb",
                    known_effects: "Unknown",
                    note: "Unknown"
                };
            }

            let tooltip = document.createElement("div");
            tooltip.classList.add("orb-tooltip");
            tooltip.innerHTML = `<strong>${orbInfo.orb_name}</strong><br>
                                 Known Effect(s): ${orbInfo.known_effects || 'Unknown'}<br>
                                 Note: ${orbInfo.note || 'None'}`;
            document.body.appendChild(tooltip);
            tooltip.style.position = "absolute";
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;

            event.target.addEventListener("mouseleave", () => {
                tooltip.remove();
            }, { once: true });
        });
    });
}

async function updateExplorerTable() {
    const canEdit = await checkUserCanEdit();
    console.log("Updating explorer table...");
    updateEditColumnVisibility(canEdit);
}

document.addEventListener("DOMContentLoaded", () => {
    updateExplorerTable();
});

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
function formatCitation(citation) {
    if (!citation || typeof citation !== 'object') return 'Missing';
    return `Vol:${citation.volume || ''} Ch:${citation.chapter || ''} JNC Part:${citation.jnc_part || ''}`;
}