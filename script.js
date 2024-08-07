document.addEventListener('DOMContentLoaded', () => {
    const activityInput = document.getElementById('activity');
    const durationInput = document.getElementById('duration');
    const addButton = document.getElementById('add-activity');
    const activityList = document.getElementById('activity-list');
    const totalDuration = document.getElementById('total-duration');

    let activities = [];

    addButton.addEventListener('click', addActivity);

    function addActivity() {
        const activity = activityInput.value.trim();
        const duration = parseInt(durationInput.value);

        if (activity && duration) {
            activities.push({ activity, duration });
            updateActivityList();
            updateTotalDuration();
            clearInputs();
        }
    }

    function updateActivityList() {
        activityList.innerHTML = '';
        activities.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${item.activity} - ${item.duration} minutes`;
            activityList.appendChild(li);
        });
    }

    function updateTotalDuration() {
        const total = activities.reduce((sum, item) => sum + item.duration, 0);
        totalDuration.textContent = total;
    }

    function clearInputs() {
        activityInput.value = '';
        durationInput.value = '';
    }
});