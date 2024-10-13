document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#orb-table")) {
        // Fetch orb info and display it sorted by orb_name alphabetically
        fetch('data/orb_info.json')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector("#orb-table tbody");

                // Sort orbs by orb_name alphabetically
                const sortedOrbs = data.sort((a, b) => {
                    const nameA = a.orb_name.toLowerCase();
                    const nameB = b.orb_name.toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                // Populate the table with orb data (only orb_name, no orb_id)
                sortedOrbs.forEach(orb => {
                    const row = document.createElement("tr");

                    const orbName = orb.orb_name || 'Unknown';

                    // Main orb row (clickable to show drop monsters)
                    row.innerHTML = `<td data-label="Orb Name">${orbName}</td>`;

                    // Add click event to toggle drop monsters
                    row.addEventListener('click', () => toggleOrbDetails(orb, row));

                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching the orb data:', error);
            });
    }
});

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
                        <th>Drop Creature</th>
                        <th>Probability</th>
                        <th>Cooldown</th>
                        <th>Cooldown in Seconds</th>
                    </tr>
                </thead>
                <tbody>`;

            orb.drop_rates.forEach(rate => {
                // Format numbers with commas
                const favorableOutcomes = rate.favorable_outcomes.toLocaleString();
                const totalEvents = rate.total_events.toLocaleString();
                const probability = `${favorableOutcomes} / ${totalEvents}`;
                const cooldownDays = (rate.total_events/100000000).toLocaleString();
                const cooldownSeconds = (rate.total_events/100000000*86400).toLocaleString();
                // Check if cooldown is less than 1 day, and display in hours if so
                const cooldownDisplay = cooldownDays >= 1 
                    ? `${cooldownDays.toLocaleString()} days` 
                    : `${(cooldownDays * 24).toFixed(2).toLocaleString()} hours`; // Convert days to hours if less than 1 day

                detailsContent += `<tr>
                    <td data-label="Drop Creature">${rate.drop_creature}</td>
                    <td data-label="Probability">${probability}</td>
                    <td data-label="Cooldown">${cooldownDisplay}</td>
                    <td data-label="Cooldown Seconds">${cooldownSeconds}</td>
                </tr>`;
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
