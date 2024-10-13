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
