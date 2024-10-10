document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display stats on index.html
    if (document.querySelector("#stats-container")) {
        fetch('data/explorer_stats.json')
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("stats-container");
                data.forEach(stat => {
                    const statElement = document.createElement("div");
                    statElement.className = "stat";
                    statElement.innerHTML = `<h3>${stat.explorer_name}</h3>
                                             <p>Total Points: ${stat.total_points}</p>`;
                    container.appendChild(statElement);
                });
            });
    }

    // Fetch and display explorer info on explorer_info.html
    if (document.querySelector("#explorer-table")) {
        fetch('data/explorer_info.json')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector("#explorer-table tbody");
                data.forEach(explorer => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${explorer.id}</td>
                                     <td>${explorer.first_name}</td>
                                     <td>${explorer.last_name}</td>
                                     <td>${explorer.moniker}</td>
                                     <td>${explorer.nationality}</td>
                                     <td>${new Date(explorer.date_first_known).toLocaleDateString()}</td>`;
                    tbody.appendChild(row);
                });
            });
    }
});
