document.getElementById('sleep-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get values from the form
    const bedtime = document.getElementById('bedtime').value;
    const waketime = document.getElementById('waketime').value;
    const quality = parseInt(document.getElementById('quality').value);

    // Calculate duration
    let duration = calculateHours(bedtime, waketime);
    
    // Display Results
    document.getElementById('results-display').classList.remove('hidden');
    document.getElementById('duration-result').innerText = duration.toFixed(1) + " hours";

    // Calculate Risk Behavior Score (Basic Logic Model)
    let riskBadge = document.getElementById('risk-result');
    riskBadge.className = 'risk-badge'; // Reset classes

    if (duration >= 7 && duration <= 9 && quality >= 4) {
        riskBadge.innerText = "Low Risk Profile";
        riskBadge.classList.add('risk-low');
    } else if (duration < 6 || quality <= 2) {
        riskBadge.innerText = "Elevated Risk Profile";
        riskBadge.classList.add('risk-high');
    } else {
        riskBadge.innerText = "Moderate Risk Profile";
        riskBadge.classList.add('risk-moderate');
    }
});

// Helper function to calculate time difference
function calculateHours(start, end) {
    let startTime = new Date(`01/01/2000 ${start}`);
    let endTime = new Date(`01/01/2000 ${end}`);

    if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1); // Accounts for sleeping past midnight
    }

    let diff = endTime.getTime() - startTime.getTime();
    return diff / (1000 * 60 * 60);
}
