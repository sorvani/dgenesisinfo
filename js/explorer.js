// Function to toggle orbs_used, rankings over time, and stats subtables
function toggleOrbsAndStats(explorer, orbData, row) {
    let nextRow = row.nextElementSibling;

    // Check if the details rows already exist
    if (nextRow && nextRow.classList.contains('orb-details-row')) {
        nextRow.remove();  // Remove all details rows if toggled off
        nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('rankings-row')) nextRow.remove();  // Remove rankings row
        nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('stat-details-row')) nextRow.remove();  // Remove stats row
    } else {
        // Create new row for orbs_used
        const orbsRow = document.createElement("tr");
        orbsRow.classList.add('orb-details-row');
        const orbsCell = document.createElement("td");
        orbsCell.setAttribute('colspan', '7');

        let orbsContent = '<div class="details-section"><h3>Orbs Used</h3>';
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
                let citation = '';
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

        // Create new row for Rankings Over Time
        const rankingsRow = document.createElement("tr");
        rankingsRow.classList.add('rankings-row');
        const rankingsCell = document.createElement("td");
        rankingsCell.setAttribute('colspan', '7');

        let rankingsContent = '<div class="details-section"><h3>Rankings Over Time</h3>';
        /*if (explorer.rankings && explorer.rankings.length > 0) {
            rankingsContent += `<table class="details-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Known Above Rank</th>
                        <th>Date Noted</th>
                        <th>Citation</th>
                    </tr>
                </thead><tbody>`;

            explorer.rankings.forEach(ranking => {
                const dateNoted = formatDate(ranking.date_noted);
                const rank = ranking.rank !== 0 ? ranking.rank.toLocaleString() : 'Unknown';
                const knownAbove = ranking.known_above_rank ? `Above ${ranking.known_above_rank.toLocaleString()}` : '';
                let citation = '';
                if (ranking.citation && ranking.citation.length > 0) {
                    ranking.citation.forEach(cite => {
                        citation += `Vol:${cite.volume || ''} Ch:${cite.chapter || ''} JNC Part:${cite.jnc_part !== null ? cite.jnc_part : ''}<br />`;
                    });
                } else {
                    citation = 'Missing';
                }
                rankingsContent += `<tr>
                    <td data-label="Rank">${rank}</td>
                    <td data-label="Known Above Rank">${knownAbove}</td>
                    <td data-label="Date Noted">${dateNoted}</td>
                    <td data-label="Citation">${citation}</td>
                </tr>`;
            });

            rankingsContent += '</tbody></table></div>';
        } else {
            rankingsContent += '<em>No ranking history available</em></div>';
        }*/
        rankingsContent += '<em>No ranking history available</em></div>';

        rankingsCell.innerHTML = rankingsContent;
        rankingsRow.appendChild(rankingsCell);
        orbsRow.after(rankingsRow);  // Insert the rankings row after orbs

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
        rankingsRow.after(statsRow);
    }
}
