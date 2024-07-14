document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('schedulingForm');
    const processesContainer = document.getElementById('processesContainer');
    const addProcessButton = document.getElementById('addProcess');
    const quantumInput = document.getElementById('quantumInput');
    const mlfqInput = document.getElementById('mlfqInput');
    const addQueueButton = document.getElementById('addQueue');
    let processCount = 1;
    let queueCount = 1;

    // Function to add a new process input field
    const addProcessField = () => {
        processCount++;
        const processDiv = document.createElement('div');
        processDiv.classList.add('process');
        processDiv.innerHTML = `
            <label>Process ${processCount}:</label>
            <input type="number" name="arrivalTime" placeholder="Arrival Time" required>
            <input type="number" name="burstTime" placeholder="Burst Time" required>
        `;
        processesContainer.appendChild(processDiv);
    };

    // Add initial process field
    addProcessField();

    // Event listener to add more process input fields
    addProcessButton.addEventListener('click', addProcessField);

    // Function to add a new queue input field for MLFQ
    const addQueueField = () => {
        queueCount++;
        const queueDiv = document.createElement('div');
        queueDiv.classList.add('queue');
        queueDiv.innerHTML = `
            <label>Queue ${queueCount}:</label>
            <input type="number" name="priority${queueCount}" placeholder="Priority" required>
            <input type="number" name="timeQuantum${queueCount}" placeholder="Time Quantum" required>
        `;
        mlfqInput.appendChild(queueDiv);
    };

    // Event listener to add more queue input fields for MLFQ
    addQueueButton.addEventListener('click', addQueueField);

    // Show/Hide quantum input field and MLFQ input fields based on selected algorithm
    form.algorithm.addEventListener('change', (event) => {
        const algorithm = event.target.value;
        if (algorithm === 'roundRobin') {
            quantumInput.style.display = 'block';
            mlfqInput.style.display = 'none';
            quantumInput.querySelector('input').required = true;
            Array.from(mlfqInput.querySelectorAll('input')).forEach((input) => {
                input.required = false;
            });
        } else if (algorithm === 'mlfq') {
            quantumInput.style.display = 'none';
            mlfqInput.style.display = 'block';
            Array.from(mlfqInput.querySelectorAll('input')).forEach((input) => {
                input.required = true;
            });
            quantumInput.querySelector('input').required = false;
        } else {
            quantumInput.style.display = 'none';
            mlfqInput.style.display = 'none';
            Array.from(mlfqInput.querySelectorAll('input')).forEach((input) => {
                input.required = false;
            });
            quantumInput.querySelector('input').required = false;
        }
    });

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const algorithm = form.algorithm.value;
        const processes = Array.from(document.querySelectorAll('.process')).map((processDiv, index) => {
            const arrivalTime = processDiv.querySelector('input[name="arrivalTime"]').value;
            const burstTime = processDiv.querySelector('input[name="burstTime"]').value;
            return {
                id: index + 1,
                arrivalTime: parseInt(arrivalTime, 10),
                burstTime: parseInt(burstTime, 10),
            };
        });

        const requestBody = { processes };

        if (algorithm === 'roundRobin') {
            const quantum = parseInt(form.quantum.value, 10);
            requestBody.quantum = quantum;
        }

        if (algorithm === 'mlfq') {
            const queues = Array.from(document.querySelectorAll('.queue')).map((queueDiv, index) => {
                const priority = queueDiv.querySelector(`input[name="priority${index + 1}"]`).value;
                const timeQuantum = queueDiv.querySelector(`input[name="timeQuantum${index + 1}"]`).value;
                return {
                    priority: parseInt(priority, 10),
                    timeQuantum: parseInt(timeQuantum, 10),
                };
            });
            requestBody.queues = queues;
        }

        fetch(`/schedule/${algorithm}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
            displayGanttChart(data);
        })
        .catch(error => console.error('Error:', error));
    });

    // Function to display results
    const displayResults = (data) => {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '<h2>Results</h2>';
        const table = document.createElement('table');
        table.innerHTML = `
            <tr>
                <th>Process ID</th>
                <th>Start Time</th>
                <th>Completion Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
            </tr>
        `;
        data.forEach((result) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.processId}</td>
                <td>${result.startTime}</td>
                <td>${result.completionTime}</td>
                <td>${result.turnaroundTime}</td>
                <td>${result.waitingTime}</td>
            `;
            table.appendChild(row);
        });
        resultsDiv.appendChild(table);
    };

    // Function to display Gantt chart
    const displayGanttChart = (data) => {
        const ganttContainer = document.getElementById('ganttContainer');
        ganttContainer.innerHTML = '';  // Clear previous chart
        const totalWidth = 800;  // Width of the Gantt chart container
        const totalDuration = data.reduce((max, process) => Math.max(max, process.completionTime), 0);
    
        data.forEach((result, index) => {
            const processDiv = document.createElement('div');
            processDiv.classList.add('gantt-process');
            const width = (result.completionTime - result.startTime) / totalDuration * totalWidth;
            const leftOffset = result.startTime / totalDuration * totalWidth;
            processDiv.style.width = `${width}px`;
            processDiv.style.left = `${leftOffset}px`; // Position based on start time
            processDiv.innerHTML = `P${result.processId} (${result.startTime} - ${result.completionTime})`;
            processDiv.style.backgroundColor = index % 2 === 0 ? '#8cd76f' : '#1e88e5';
            ganttContainer.appendChild(processDiv);
        });
    };
    
});
