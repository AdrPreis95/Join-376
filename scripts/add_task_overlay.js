function openTaskOverlay() {
    if (!document.getElementById("task-overlay")) {
        fetch('./task_overlay.html')
            .then(response => response.text())
            .then(data => {
                document.body.insertAdjacentHTML('beforeend', data);
                document.getElementById("task-overlay").style.display = 'inline-table';
            })
            .catch(error => console.error('Error loading overlay:', error));
    } else {
        document.getElementById("task-overlay").style.display = 'block';
    }
}

function closeTaskOverlay() {
    const overlay = document.getElementById("task-overlay");
    if (overlay) {
        overlay.style.display = 'none';
    }
}

