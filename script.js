document.addEventListener('DOMContentLoaded', () => {
    const activityInput = document.getElementById('activity');
    const durationInput = document.getElementById('duration');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('activity-date');
    const addButton = document.getElementById('add-activity');
    const activityList = document.getElementById('activity-list');
    const totalDuration = document.getElementById('total-duration');
    const filterCategory = document.getElementById('filter-category');
    const calendar = document.getElementById('calendar');

    let activities = JSON.parse(localStorage.getItem('activities')) || [];

    function saveActivities() {
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    function addActivity() {
        const activity = activityInput.value.trim();
        const duration = parseInt(durationInput.value);
        const category = categorySelect.value;
        const date = dateInput.value;

        if (activity && duration && date) {
            activities.push({ id: Date.now(), activity, duration, category, date });
            saveActivities();
            updateActivityList();
            updateStatistics();
            updateCalendar();
            clearInputs();
        }
    }

    function updateActivityList() {
        activityList.innerHTML = '';
        const filteredActivities = filterActivities();
        filteredActivities.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="activity-info">
                    <strong>${item.activity}</strong> - ${item.duration} minutes
                    <br>
                    Category: ${item.category}, Date: ${item.date}
                </div>
                <div class="activity-actions">
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </div>
            `;
            activityList.appendChild(li);
        });
    }

    function filterActivities() {
        const selectedCategory = filterCategory.value;
        return selectedCategory === 'all'
            ? activities
            : activities.filter(item => item.category === selectedCategory);
    }

    function updateStatistics() {
        const stats = {
            total: 0,
            cardio: 0,
            strength: 0,
            flexibility: 0,
            other: 0
        };

        activities.forEach(item => {
            stats.total += item.duration;
            stats[item.category] += item.duration;
        });

        totalDuration.textContent = stats.total;
        document.getElementById('cardio-duration').textContent = stats.cardio;
        document.getElementById('strength-duration').textContent = stats.strength;
        document.getElementById('flexibility-duration').textContent = stats.flexibility;
        document.getElementById('other-duration').textContent = stats.other;
    }

    function updateCalendar() {
        calendar.innerHTML = '';
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendar.appendChild(document.createElement('div'));
        }

        // Add calendar days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;

            const currentDateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const hasActivity = activities.some(activity => activity.date === currentDateString);

            if (hasActivity) {
                dayElement.classList.add('has-activity');
            }

            calendar.appendChild(dayElement);
        }
    }

    function clearInputs() {
        activityInput.value = '';
        durationInput.value = '';
        categorySelect.value = 'cardio';
        dateInput.value = '';
    }

    function editActivity(id) {
        const activity = activities.find(item => item.id === id);
        if (activity) {
            activityInput.value = activity.activity;
            durationInput.value = activity.duration;
            categorySelect.value = activity.category;
            dateInput.value = activity.date;
            activities = activities.filter(item => item.id !== id);
            saveActivities();
            updateActivityList();
            updateStatistics();
            updateCalendar();
        }
    }

    function deleteActivity(id) {
        activities = activities.filter(item => item.id !== id);
        saveActivities();
        updateActivityList();
        updateStatistics();
        updateCalendar();
    }

    addButton.addEventListener('click', addActivity);

    filterCategory.addEventListener('change', updateActivityList);

    activityList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            editActivity(parseInt(e.target.dataset.id));
        } else if (e.target.classList.contains('delete-btn')) {
            deleteActivity(parseInt(e.target.dataset.id));
        }
    });

    // Initial render
    updateActivityList();
    updateStatistics();
    updateCalendar();
});