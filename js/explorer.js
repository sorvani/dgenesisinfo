document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display explorer info with latest ranking on index.html
    if (document.querySelector("#explorer-table")) {
        fetch('data/explorer_info.json')
            .then(response => response.json())
            .then(data => {
                // Extract the latest rank from the rankings array and sort by rank
                const explorersWithRanks = data.map(explorer => {
                    if (explorer.rankings && explorer.rankings.length > 0) {
                        const latestRanking = explorer.rankings.sort((a, b) => b.date_noted - a.date_noted)[0];
                        explorer.latest_rank = latestRanking.rank !== 0 ? latestRanking.rank : null;
                        let citeVolume, citeChapter, citeJNCPart;

                        // Check if there's a citation array and populate the citation variable
                        if (latestRanking.citation && latestRanking.citation.length > 0) {
                            // Loop through citations and display them
                            latestRanking.citation.forEach(cite => {
                                citeVolume = cite.volume || '';
                                citeChapter = cite.chapter || '';
                                citeJNCPart = cite.j_novel_part !== null ? cite.j_novel_part : '';
                            });
                            explorer.rank_citation = `Vol: ${citeVolume} Ch: ${citeChapter} JNC Part: ${citeJNCPart}<br />`;
                        } else {
                            explorer.rank_citation = null;
                        }
                    } else {
                        explorer.latest_rank = null;  // If no rank available
                        explorer.rank_citation = null;
                    }
                    return explorer;
                });

                // Sort explorers by latest_rank (null ranks at the bottom)
                explorersWithRanks.sort((a, b) => {
                    if (a.latest_rank === null) return 1;
                    if (b.latest_rank === null) return -1;
                    return a.latest_rank - b.latest_rank;
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

                    // Add click event to toggle stats subtable
                    row.addEventListener('click', () => toggleStatsTable(explorer, row));
                    
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching the explorer data:', error);
            });
    }
});

// Function to toggle the stats subtable
function toggleStatsTable(explorer, row) {
    let statsRow = row.nextElementSibling;

    // Check if subtable already exists
    if (statsRow && statsRow.classList.contains('stats-row')) {
        statsRow.remove();  // Remove the subtable if it already exists (toggle off)
    } else {
        // Create new row for the stats subtable
        statsRow = document.createElement("tr");
        statsRow.classList.add('stats-row', 'detail-row');
        const statsCell = document.createElement("td");
        statsCell.setAttribute('colspan', '7');

        if (explorer.stats && explorer.stats.length > 0) {
            // Sort stats by the sum of date_noted and date_sequence
            const sortedStats = explorer.stats.sort((a, b) => {
                return (a.date_noted + a.date_sequence) - (b.date_noted + b.date_sequence);
            });

            // Build the subtable
            let statsTable = `<table class="stats-table"><thead>
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
            
            sortedStats.forEach(stat => {
                statsTable += `<tr>
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
                    // Check if there's a citation array and add it to the stat row
                    if (stat.citation && stat.citation.length > 0) {
                        // Loop through citations and display them. normally there is only one, but more could be possible so used loop
                        stat.citation.forEach(cite => {
                            statsTable += `<td data-label="Citation">Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part: ${cite.j_novel_part !== null ? cite.j_novel_part : ''}</td>`;
                        });
                    } else {
                        statsTable += `<td data-label="Citation">Missing</td>`;
                    }
                statsTable += `</tr>`;
            });

            statsTable += '</tbody></table>';
            statsCell.innerHTML = statsTable;
        } else {
            statsCell.innerHTML = '<em>No stats available</em>';
        }

        statsRow.appendChild(statsCell);
        row.after(statsRow);  // Insert the subtable after the clicked row
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