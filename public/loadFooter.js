
document.addEventListener("DOMContentLoaded", () => {
    fetch('/footer.html')
        .then(response => response.text())
        .then(footerHTML => {
            document.getElementById("footer-container").innerHTML = footerHTML;
        })
        .catch(error => console.error("Error loading footer:", error));
});
