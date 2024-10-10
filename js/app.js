document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display explorer info on explorer_info.html
    if (document.querySelector("#explorer-table")) {
        fetch('data/explorer_info.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const tbody = document.querySelector("#explorer-table tbody");

                // Function to format date to MM/DD/YYYY
                const formatDate = (dateString) => {
                    if (!dateString) return '';  // Return empty string if dateString is null
                    const date = new Date(dateString);
                    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Get month and add leading 0
                    const day = ('0' + date.getDate()).slice(-2);          // Get day and add leading 0
                    const year = date.getFullYear();                       // Get year
                    return `${month}/${day}/${year}`;                      // Return formatted date
                };

                // Loop through each explorer object in the JSON data
                data.forEach(explorer => {
                    // Replace null values with empty strings
                    const id = explorer.id || '';
                    const firstName = explorer.first_name || '';
                    const lastName = explorer.last_name || '';
                    const moniker = explorer.moniker || 'N/A'; // Optional default 'N/A'
                    const nationality = explorer.nationality || '';
                    const dateFirstKnown = formatDate(explorer.date_first_known); // Format date

                    // Create a new table row
                    const row = document.createElement("tr");

                    // Populate the row with explorer data
                    row.innerHTML = `<td>${id}</td>
                                     <td>${firstName}</td>
                                     <td>${lastName}</td>
                                     <td>${moniker}</td>
                                     <td>${nationality}</td>
                                     <td>${dateFirstKnown}</td>`;
                    
                    // Append the row to the table body
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching the explorer data:', error);
            });
    }
});
