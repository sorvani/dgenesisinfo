document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display explorer info with latest ranking on index.html
    if (document.querySelector("#explorer-table")) {
        fetch('data/explorer_info.json')
            .then(response => response.json())
            .then(explorerData => {
                // Fetch orb_info to match orbs with explorers
                fetch('data/orb_info.json')
                    .then(response => response.json())
                    .then(orbData => {
                        // Extract the latest rank from the rankings array and sort by rank
                        const explorersWithRanks = explorerData.map(explorer => {
                            if (explorer.rankings && explorer.rankings.length > 0) {
                                const latestRanking = explorer.rankings.sort((a, b) => toUnixTimestamp(b.date_noted) - toUnixTimestamp(a.date_noted))[0];
                                explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank : null;
                                
                                // Check if there is a known_above_rank and use that if latest_rank is null
                                if (explorer.latest_rank === null && latestRanking.known_above_rank) {
                                    explorer.latest_rank = `Above ${latestRanking.known_above_rank.toLocaleString()}`;
                                    explorer.rank_value_for_sort = latestRanking.known_above_rank - 1; // Use for sorting purposes
                                } else {
                                    explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank.toLocaleString() : 'Unknown';
                                    explorer.rank_value_for_sort = latestRanking.rank !== 0 ? latestRanking.rank : Infinity;
                                }

                                // Handle citation data
                                let citeVolume, citeChapter, citeJNCPart;
                                if (latestRanking.citation && latestRanking.citation.length > 0) {
                                    latestRanking.citation.forEach(cite => {
                                        citeVolume = cite.volume || '';
                                        citeChapter = cite.chapter || '';
                                        citeJNCPart = cite.jnc_part !== null ? cite.jnc_part : '';
                                    });
                                    explorer.rank_citation = `Vol: ${citeVolume} Ch: ${citeChapter} JNC Part: ${citeJNCPart}<br />`;
                                } else {
                                    explorer.rank_citation = null;
                                }
                            } else {
                                explorer.latest_rank = null;
                                explorer.rank_citation = null;
                                explorer.rank_value_for_sort = Infinity; // Rank as lowest if completely unknown
                            }
                            return explorer;
                        });

                        // Sort explorers by latest_rank (or known_above_rank for those with "Above" ranks)
                        explorersWithRanks.sort((a, b) => {
                            if (a.rank_value_for_sort === null) return 1;
                            if (b.rank_value_for_sort === null) return -1;
                            return a.rank_value_for_sort - b.rank_value_for_sort;
                        });

                        // Populate the table with sorted data
                        const tbody = document.querySelector("#explorer-table tbody");
                        explorersWithRanks.forEach(explorer => {
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

                            // Populate the row with data-label attributes for responsive design
                            row.innerHTML = `<td data-label="Rank">${latestRank}</td>
                                             <td data-label="Name">${firstName} ${lastName}</td>
                                             <td data-label="Name is Public">${nameKnown}</td>
                                             <td data-label="Moniker">${moniker}</td>
                                             <td data-label="Nationality">${nationality}</td>
                                             <td data-label="Date First Known">${dateFirstKnown}</td>
                                             <td data-label="Rank Citation">${rankCitation}</td>`;

                            // Add click event to toggle orbs and stats subtable
                            row.addEventListener('click', () => toggleOrbsAndStats(explorer, orbData, row));

                            tbody.appendChild(row);
                        });
                    });
            })
            .catch(error => {
                console.error('Error fetching explorer or orb data:', error);
            });
    }
});

// Function to toggle orbs_used and stats subtable
function toggleOrbsAndStats(explorer, orbData, row) {
    let nextRow = row.nextElementSibling;

    // Check if the details rows already exist
    if (nextRow && nextRow.classList.contains('orb-details-row')) {
        nextRow.remove();  // Remove both orb and stat rows if toggled off
        nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('stat-details-row')) {
            nextRow.remove();  // Remove stats row
        }
    } else {
        // Create new row for orbs_used
        const orbsRow = document.createElement("tr");
        orbsRow.classList.add('orb-details-row');
        const orbsCell = document.createElement("td");
        orbsCell.setAttribute('colspan', '7');

        let orbsContent = '<div class="details-section"><h3>Orbs Used</h3>';
        // Display orbs associated with the explorer
        if (explorer.orbs_used && explorer.orbs_used.length > 0) {
            orbsContent += `<table class="details-table">
                <thead>
                    <tr>
                        <th>Orb Name</th>
                        <th>Date Acquired</th>
                        <th>Note</th>
                        <th>Citation</th>
                    </tr>
                </thead><tbody>`;

            explorer.orbs_used.forEach(orbUsed => {
                const orbInfo = orbData.find(orb => orb.orb_id === orbUsed.orb_id);
                const orbName = orbInfo ? orbInfo.orb_name : 'Unknown Orb';
                const dateAcquired = formatDate(orbUsed.date_acquired);
                const dateNote = orbUsed.date_note || '';
                let citation = "";
                if (orbUsed.citation && orbUsed.citation.length > 0) {
                    orbUsed.citation.forEach(cite => {
                        citation += `Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part:${cite.jnc_part !== null ? cite.jnc_part : ''}<br />`;
                    });
                } else {
                    citation = 'Missing';
                }
                orbsContent += `<tr>
                    <td data-label="Orb Name">${orbName}</td>
                    <td data-label="Date Acquired">${dateAcquired}</td>
                    <td data-label="Note">${dateNote}</td>
                    <td data-label="Citation">${citation}</td>
                </tr>`;
            });

            orbsContent += '</tbody></table></div>';
        } else {
            orbsContent += '<em>No orbs known to have been used</em></div>';
        }

        orbsCell.innerHTML = orbsContent;
        orbsRow.appendChild(orbsCell);
        row.after(orbsRow);  // Insert the orbs row after the clicked row

        // Create new row for stats
        const statsRow = document.createElement("tr");
        statsRow.classList.add('stat-details-row');
        const statsCell = document.createElement("td");
        statsCell.setAttribute('colspan', '7');

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

            explorer.stats.forEach(stat => {
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

                if (stat.citation && stat.citation.length > 0) {
                    stat.citation.forEach(cite => {
                        statsContent += `<td data-label="Citation">Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part:${cite.jnc_part !== null ? cite.jnc_part : ''}</td>`;
                    });
                } else {
                    statsContent += '<td data-label="Citation">Missing</td>';
                }
                statsContent += '</tr>';
            });

            statsContent += '</tbody></table></div>';
        } else {
            statsContent += '<em>No stats available</em></div>';
        }

        statsCell.innerHTML = statsContent;
        statsRow.appendChild(statsCell);
        orbsRow.after(statsRow);
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Function to check if date_noted is Gregorian and convert to Unix timestamp
function toUnixTimestamp(dateNoted) {
    // If dateNoted is a number (already Unix timestamp), return as-is
    if (typeof dateNoted === 'number') {
        return dateNoted;
    }

    // If dateNoted is a valid Gregorian string, convert to Unix timestamp
    const parsedDate = new Date(dateNoted);
    
    // Check if the parsedDate is valid (not "Invalid Date")
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getTime();  // Convert to Unix timestamp (milliseconds since Jan 1, 1970)
    } else {
        console.error('Invalid date format for:', dateNoted);
        return null;  // Return null if invalid date format
    }
}