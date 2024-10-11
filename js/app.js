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
                    } else {
                        explorer.latest_rank = null;  // If no rank available
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
                    const latestRank = explorer.latest_rank !== null ? explorer.latest_rank : 'N/A';
                    const nameKnown = explorer.public === 1 ? '&#10004;' : '';  // Check as number, not string

                    // Populate the row with data-label attributes for responsive design
                    row.innerHTML = `<td data-label="Rank">${latestRank}</td>
                                    <td data-label="Name">${firstName} ${lastName}</td>
                                    <td data-label="Name is Public">${nameKnown}</td>
                                    <td data-label="Moniker">${moniker}</td>
                                    <td data-label="Nationality">${nationality}</td>
                                    <td data-label="Date First Known">${dateFirstKnown}</td>`;

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

// The submitCorrection function for form submission
function submitCorrection() {
    const correctionType = document.getElementById('correction-type').value;
    const explorerName = document.getElementById('explorer-orb-name').value;
    const correctionDetails = document.getElementById('correction-details').value;
    
    // Construct the issue title and body
    const issueTitle = `Update${explorerName ? ` for ${encodeURIComponent(explorerName)}` : ''}`;
    const issueBody = `Update Details:\n${correctionDetails}`;
    
    const githubUsername = 'sorvani'; 
    const githubRepo = 'dgenesisinfo';
    const labels = encodeURIComponent(correctionType);  // Use the correction type as a label
    
    // Construct the GitHub issue URL
    const githubIssueUrl = `https://github.com/${githubUsername}/${githubRepo}/issues/new?title=${issueTitle}&body=${encodeURIComponent(issueBody)}&labels=${labels}`;
    
    // Redirect user to GitHub to finalize the issue
    window.open(githubIssueUrl, '_blank');

    // Hide the form again after submission
    const formSection = document.getElementById('correction-form');
    formSection.style.display = 'none';

    // Reset the form fields after submission
    document.getElementById('github-issue-form').reset();
}

// Function to show the form
function showForm() {
    const formSection = document.getElementById('correction-form');
    formSection.style.display = 'block';  // Show the form when the link is clicked
}

// Function to toggle the stats subtable
function toggleStatsTable(explorer, row) {
    let statsRow = row.nextElementSibling;

    // Check if subtable already exists
    if (statsRow && statsRow.classList.contains('stats-row')) {
        statsRow.remove();  // Remove the subtable if it already exists (toggle off)
    } else {
        // Create new row for the stats subtable
        statsRow = document.createElement("tr");
        statsRow.classList.add('stats-row');
        const statsCell = document.createElement("td");
        statsCell.setAttribute('colspan', '6');

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
                    <th>Sequence</th>
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
                    <th>Citation></th>
                </tr></thead><tbody>`;
            
            sortedStats.forEach(stat => {
                statsTable += `<tr>
                    <td data-label="Reading Date">${formatDate(stat.date_noted)}</td>
                    <td data-label="Scan Type">${stat.scan_type}</td>
                    <td data-label="Sequence">${stat.date_sequence}</td>
                    <td data-label="SP">${stat.sp !== null ? stat.sp : ''}</td>
                    <td data-label="HP">${stat.hp}</td>
                    <td data-label="MP">${stat.mp}</td>
                    <td data-label="STR">${stat.str}</td>
                    <td data-label="VIT">${stat.vit}</td>
                    <td data-label="INT">${stat.int}</td>
                    <td data-label="AGI">${stat.agi}</td>
                    <td data-label="DEX">${stat.dex}</td>
                    <td data-label="LUC">${stat.luc}</td>
                    <td data-label="Stat Total">${stat.stat_total}</td>
                    <td data-label="Deviation">${stat.points_from_average}</td>
                    <td data-label="Citation">Volume ${stat.citation[0]} Chapter ${stat.citation[0]}</td>
                </tr>`;
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