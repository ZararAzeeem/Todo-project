// This function runs when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. FETCH DATA ---
    // Get the tasks array from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- 2. CALCULATE AND DISPLAY STATS ---
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // Update the HTML elements with the calculated stats
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;

    // --- 3. PREPARE DATA FOR THE CHART ---
    // We will show tasks completed over the last 7 days

    const labels = [];
    const dataPoints = [];
    const today = new Date();

    // Create labels for the last 7 days (e.g., "Aug 18", "Aug 19", ...)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        dataPoints.push(0); // Initialize data points with 0
    }

    // Count how many tasks were completed on each of the last 7 days
    tasks.forEach(task => {
        if (task.completed) {
            const completedDate = new Date(task.id); // Using task ID as creation/completion timestamp
            const diffDays = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 7) {
                const index = 6 - diffDays; // Find the correct index in our 7-day array
                dataPoints[index]++;
            }
        }
    });

    // --- 4. RENDER THE CHART ---
    const ctx = document.getElementById('tasksChart').getContext('2d');

    // Create a gradient for the chart bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 198, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 114, 255, 0.8)');

    const tasksChart = new Chart(ctx, {
        type: 'bar', // Type of chart
        data: {
            labels: labels, // X-axis labels (days)
            datasets: [{
                label: 'Tasks Completed',
                data: dataPoints, // Y-axis data (count of tasks)
                backgroundColor: gradient,
                borderColor: '#00c6ff',
                borderWidth: 2,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true, // Make it responsive
            plugins: {
                legend: {
                    display: false // Hide the legend
                },
                title: {
                    display: true,
                    text: 'Completed Tasks (Last 7 Days)',
                    color: '#f0f0f0',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Start Y-axis at 0
                    ticks: {
                        color: '#a7a1c4',
                        stepSize: 1 // Only show whole numbers (1, 2, 3...)
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Color of the grid lines
                    }
                },
                x: {
                    ticks: { color: '#a7a1c4' },
                    grid: {
                        display: false // Hide vertical grid lines
                    }
                }
            }
        }
    });
});