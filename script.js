document.addEventListener('DOMContentLoaded', () => {
    const activityForm = document.getElementById('activity-form');
    const activityInput = document.getElementById('activity');
    const durationInput = document.getElementById('duration');
    const intensityInput = document.getElementById('intensity');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('activity-date');
    const activityList = document.getElementById('activity-list');
    const totalDuration = document.getElementById('total-duration');
    const filterCategory = document.getElementById('filter-category');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const calendar = document.getElementById('calendar');
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const goalProgress = document.getElementById('goal-progress');
    const chartCanvas = document.getElementById('activity-chart');

    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    let weeklyGoal = parseInt(localStorage.getItem('weeklyGoal')) || 0;

    // Initialize Flatpickr for date inputs
    flatpickr(dateInput, {
        dateFormat: "Y-m-d",
        defaultDate: "today"
    });

    flatpickr(filterDateFrom, {
        dateFormat: "Y-m-d",
        onChange: updateActivityList
    });

    flatpickr(filterDateTo, {
        dateFormat: "Y-m-d",
        onChange: updateActivityList
    });

    function saveActivities() {
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    function saveWeeklyGoal() {
        localStorage.setItem('weeklyGoal', weeklyGoal.toString());
    }

    function addActivity(event) {
        event.preventDefault();
        const activity = activityInput.value.trim();
        const duration = parseInt(durationInput.value);
        const intensity = parseInt(intensityInput.value);
        const category = categorySelect.value;
        const date = dateInput.value;

        if (activity && duration && date) {
            const newActivity = {
                id: Date.now(),
                activity,
                duration,
                intensity,
                category,
                date,
                caloriesBurned: calculateCaloriesBurned(duration, intensity)
            };
            activities.push(newActivity);
            saveActivities();
            updateActivityList();
            updateStatistics();
            updateCalendar();
            updateChart();
            activityForm.reset();
            showNotification('Activity added successfully!');
        } else {
            showNotification('Please fill in all fields.', 'error');
        }
    }

    function calculateCaloriesBurned(duration, intensity) {
        // Simple calculation, can be improved with more accurate formulas
        return Math.round(duration * intensity * 0.1);
    }

    function updateActivityList() {
        activityList.innerHTML = '';
        const filteredActivities = filterActivities();
        filteredActivities.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'bg-gray-50 p-4 rounded-md shadow';
            li.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <strong>${item.activity}</strong> - ${item.duration} minutes
                        <br>
                        Category: ${item.category}, Date: ${item.date}
                        <br>
                        Intensity: ${item.intensity}/10, Calories: ${item.caloriesBurned}
                    </div>
                    <div>
                        <button class="edit-btn bg-blue-500 text-white px-2 py-1 rounded mr-2" data-id="${item.id}">Edit</button>
                        <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `;
            activityList.appendChild(li);
        });
    }

    function filterActivities() {
        const selectedCategory = filterCategory.value;
        const dateFrom = filterDateFrom.value ? new Date(filterDateFrom.value) : null;
        const dateTo = filterDateTo.value ? new Date(filterDateTo.value) : null;
        
        return activities.filter(item => {
            const itemDate = new Date(item.date);
            const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
            const dateMatch = (!dateFrom || itemDate >= dateFrom) && 
                              (!dateTo || itemDate <= dateTo);
            return categoryMatch && dateMatch;
        });
    }

    function updateStatistics() {
        const stats = {
            total: 0,
            cardio: 0,
            strength: 0,
            flexibility: 0,
            other: 0,
            totalCalories: 0
        };

        activities.forEach(item => {
            stats.total += item.duration;
            stats[item.category] += item.duration;
            stats.totalCalories += item.caloriesBurned;
        });

        totalDuration.textContent = stats.total;
        document.getElementById('cardio-duration').textContent = stats.cardio;
        document.getElementById('strength-duration').textContent = stats.strength;
        document.getElementById('flexibility-duration').textContent = stats.flexibility;
        document.getElementById('other-duration').textContent = stats.other;
        document.getElementById('total-calories').textContent = stats.totalCalories;

        updateGoalProgress(stats.total);
    }

    function updateGoalProgress(totalDuration) {
        const progress = weeklyGoal > 0 ? (totalDuration / weeklyGoal) * 100 : 0;
        goalProgress.style.width = `${Math.min(progress, 100)}%`;
        goalProgress.textContent = `${Math.round(progress)}%`;
        
        if (progress >= 100) {
            showNotification('Congratulations! You\'ve reached your weekly goal!');
        }
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
            const dayActivities = activities.filter(activity => activity.date === currentDateString);

            if (dayActivities.length > 0) {
                dayElement.classList.add('has-activity');
                const totalDuration = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);
                const activityInfo = document.createElement('div');
                activityInfo.className = 'activity-info';
                activityInfo.textContent = `${totalDuration} min`;
                dayElement.appendChild(activityInfo);
            }

            calendar.appendChild(dayElement);
        }
    }

    function updateChart() {
        const ctx = chartCanvas.getContext('2d');
        const categoryData = {
            cardio: 0,
            strength: 0,
            flexibility: 0,
            other: 0
        };

        activities.forEach(activity => {
            categoryData[activity.category] += activity.duration;
        });

        if (window.myChart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Activity Distribution'
                }
            }
        });
    }

    function editActivity(id) {
        const activity = activities.find(item => item.id === parseInt(id));
        if (activity) {
            activityInput.value = activity.activity;
            durationInput.value = activity.duration;
            intensityInput.value = activity.intensity;
            categorySelect.value = activity.category;
            dateInput.value = activity.date;
            activities = activities.filter(item => item.id !== parseInt(id));
            saveActivities();
            updateActivityList();
            updateStatistics();
            updateCalendar();
            updateChart();
        }
    }

    function deleteActivity(id) {
        activities = activities.filter(item => item.id !== parseInt(id));
        saveActivities();
        updateActivityList();
        updateStatistics();
        updateCalendar();
        updateChart();
        showNotification('Activity deleted successfully!');
    }

    function setWeeklyGoal(event) {
        event.preventDefault();
        const newGoal = parseInt(goalInput.value);
        if (newGoal > 0) {
            weeklyGoal = newGoal;
            saveWeeklyGoal();
            updateStatistics();
            showNotification('Weekly goal updated!');
        } else {
            showNotification('Please enter a valid goal.', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    activityForm.addEventListener('submit', addActivity);
    goalForm.addEventListener('submit', setWeeklyGoal);

    filterCategory.addEventListener('change', updateActivityList);

    activityList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            editActivity(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteActivity(e.target.dataset.id);
        }
    });

    // Initial render
    updateActivityList();
    updateStatistics();
    updateCalendar();
    updateChart();
});