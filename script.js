// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || {};
let mascotConfig = JSON.parse(localStorage.getItem('mascotConfig')) || {
    type: 'cat',
    color: '#FFB7E0'
};

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskTime = document.getElementById('task-time');
const taskCategory = document.getElementById('task-category');
const tasksContainer = document.getElementById('tasks-container');
const modal = document.getElementById('celebration-modal');
const progressTracker = document.getElementById('progress-tracker');
const mascotContainer = document.getElementById('mascot-container');
const achievementsList = document.querySelector('.achievement-list');

// Theme management
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.body.dataset.theme = btn.dataset.theme;
        localStorage.setItem('theme', btn.dataset.theme);
    });
});

// Mascot customization
document.getElementById('mascot-type').addEventListener('change', (e) => {
    mascotConfig.type = e.target.value;
    updateMascot();
    saveMascotConfig();
});

document.getElementById('mascot-color').addEventListener('change', (e) => {
    mascotConfig.color = e.target.value;
    updateMascot();
    saveMascotConfig();
});

function saveMascotConfig() {
    localStorage.setItem('mascotConfig', JSON.stringify(mascotConfig));
}

function updateMascot() {
    const mascotSVG = generateMascotSVG(mascotConfig.type, mascotConfig.color);
    mascotContainer.innerHTML = mascotSVG;
}

function generateMascotSVG(type, color) {
    const mascots = {
        cat: `<svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="${color}"/>
                <circle cx="35" cy="45" r="5" fill="white"/>
                <circle cx="65" cy="45" r="5" fill="white"/>
                <circle cx="35" cy="45" r="2" fill="#000"/>
                <circle cx="65" cy="45" r="2" fill="#000"/>
                <path d="M 45 60 Q 50 65 55 60" stroke="#000" fill="none"/>
                <path d="M 25 25 L 35 35 M 75 25 L 65 35" stroke="#000"/>
            </svg>`,
        bunny: `<svg viewBox="0 0 100 100">
                <circle cx="50" cy="60" r="30" fill="${color}"/>
                <circle cx="50" cy="30" r="20" fill="${color}"/>
                <circle cx="40" cy="25" r="8" fill="white"/>
                <circle cx="60" cy="25" r="8" fill="white"/>
                <circle cx="45" cy="55" r="3" fill="#000"/>
                <circle cx="55" cy="55" r="3" fill="#000"/>
                <path d="M 47 62 Q 50 65 53 62" stroke="#000" fill="none"/>
            </svg>`,
        bear: `<svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="${color}"/>
                <circle cx="30" cy="35" r="10" fill="#8B4513"/>
                <circle cx="70" cy="35" r="10" fill="#8B4513"/>
                <circle cx="40" cy="50" r="5" fill="#000"/>
                <circle cx="60" cy="50" r="5" fill="#000"/>
                <path d="M 45 65 Q 50 70 55 65" stroke="#000" fill="none"/>
            </svg>`
    };
    return mascots[type] || mascots.cat;
}

// Achievement templates
const achievementTemplates = {
    firstTask: {
        id: 'firstTask',
        icon: '🌟',
        title: 'First Step',
        description: 'Complete your first task'
    },
    speedster: {
        id: 'speedster',
        icon: '⚡',
        title: 'Speed Runner',
        description: 'Complete a task before the deadline'
    },
    streakMaster: {
        id: 'streakMaster',
        icon: '🔥',
        title: 'Streak Master',
        description: 'Complete 5 tasks in a row'
    }
};

// Achievement system
function checkAchievements(task) {
    if (!achievements.firstTask && tasks.length === 1) {
        unlockAchievement('firstTask');
    }

    if (!achievements.speedster && task.completed && new Date() < new Date(task.dueTime)) {
        unlockAchievement('speedster');
    }

    const completedTasks = tasks.filter(t => t.completed).length;
    if (!achievements.streakMaster && completedTasks >= 5) {
        unlockAchievement('streakMaster');
    }
}

function unlockAchievement(achievementId) {
    const achievement = achievementTemplates[achievementId];
    achievements[achievementId] = true;
    localStorage.setItem('achievements', JSON.stringify(achievements));

    const badge = document.createElement('div');
    badge.className = 'achievement-badge new';
    badge.innerHTML = achievement.icon;
    badge.title = `${achievement.title}\n${achievement.description}`;
    achievementsList.appendChild(badge);

    showCelebration(`You've earned the "${achievement.title}" achievement!`);
}

// Enhanced celebrations
function showCelebration(message) {
    const celebrationText = document.getElementById('celebration-text');
    celebrationText.textContent = message || "Task Completed!";
    modal.style.display = 'flex';
    createSparkles();

    // Animate mascot
    const mascot = mascotContainer.querySelector('svg');
    mascot.style.animation = 'celebrate 1s ease-in-out';

    setTimeout(() => {
        modal.style.display = 'none';
        mascot.style.animation = '';
    }, 3000);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Format time remaining
function formatTimeRemaining(endTime) {
    const now = new Date().getTime();
    const timeLeft = new Date(endTime).getTime() - now;

    if (timeLeft <= 0) return 'Time is up!';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
}

// Timer animations
function updateTimers() {
    tasks.forEach((task, index) => {
        if (!task.completed) {
            const timerElement = document.getElementById(`timer-${index}`);
            if (timerElement) {
                const now = new Date().getTime();
                const end = new Date(task.dueTime).getTime();
                const total = end - task.createdAt.getTime();
                const remaining = end - now;
                const progress = ((total - remaining) / total) * 100;

                const timerFill = timerElement.querySelector('.timer-fill');
                if (timerFill) {
                    timerFill.style.background = `conic-gradient(
                        var(--primary) ${progress}%,
                        transparent ${progress}%
                    )`;
                }

                if (remaining <= 0 && !task.notified) {
                    task.notified = true;
                    saveTasks();
                    showNotification(task.title);
                }
            }
        }
    });
}

// Progress tracking
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = (completed / total) * 100 || 0;

    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${completed}/${total} tasks completed`;
}

// Show notification
function showNotification(taskTitle) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Time's up!", {
            body: `The task "${taskTitle}" is due now!`,
            icon: "/manifest-icon.png"
        });
    }
}

// Request notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}

// Render tasks with categories and timers
function renderTasks() {
    tasksContainer.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title ${task.completed ? 'completed' : ''}">
                    <span class="task-category-icon">${getCategoryIcon(task.category)}</span>
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="toggleTask(${index})"></div>
                    ${task.title}
                </div>
                <div class="timer-container" id="timer-${index}">
                    <div class="timer-circle">
                        <div class="timer-fill"></div>
                        <span class="timer-text">${formatTimeRemaining(task.dueTime)}</span>
                    </div>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        tasksContainer.appendChild(taskElement);
    });
    updateProgress();
}

function getCategoryIcon(category) {
    const icons = {
        work: '💼',
        personal: '💝',
        shopping: '🛍️',
        health: '💪',
        study: '📚'
    };
    return icons[category] || '📝';
}

// Add new task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    const dueTime = taskTime.value;
    const category = taskCategory.value;

    if (title && dueTime && category) {
        const task = {
            title,
            dueTime,
            category,
            completed: false,
            notified: false,
            createdAt: new Date()
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskTime.value = '';
        taskCategory.value = '';
    }
});

// Toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
    checkAchievements(tasks[index]);
    if (tasks[index].completed) {
        showCelebration();
    }
}

// Delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Create sparkle effects
function createSparkles() {
    const sparklesContainer = document.querySelector('.sparkles');
    sparklesContainer.innerHTML = '';

    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${getRandomColor()};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: sparkle 1s ease-in-out infinite;
            opacity: 0;
        `;
        sparklesContainer.appendChild(sparkle);
    }
}

function getRandomColor() {
    const colors = ['#FFD700', '#FF69B4', '#FF1493', '#FF00FF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize the application
function init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    }

    // Initialize mascot
    updateMascot();

    // Start timers
    setInterval(updateTimers, 1000);

    // Initial render
    renderTasks();
}

// Start timer updates
setInterval(updateTimers, 1000);

// Initial render
renderTasks();

// PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Add sparkle animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0); opacity: 0; }
    }
    @keyframes celebrate {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize the application
init();