
document.addEventListener("DOMContentLoaded", () => {
    fetch('/header.html')
        .then(response => response.text())
        .then(headerHTML => {
            document.getElementById("header-container").innerHTML = headerHTML;
        })
        .catch(error => console.error("Error loading header:", error));
});
