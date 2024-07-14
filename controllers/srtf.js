// Function to display Gantt chart for preemptive scheduling
const generateGanttChartSegments = (segments) => {
    return segments.map(segment => ({
        processId: segment.processId,
        start: segment.start,
        end: segment.end,
        color: segment.color
    }));
};

module.exports = function srtf(processes) {
    // Input validation
    if (!Array.isArray(processes)) {
        throw new Error('Invalid input: processes must be an array');
    }

    if (processes.some(process => typeof process.id !== 'number' || typeof process.arrivalTime !== 'number' || typeof process.burstTime !== 'number')) {
        throw new Error('Invalid input: processes must have id, arrivalTime, and burstTime properties');
    }

    let currentTime = 0;
    let completed = 0;
    const n = processes.length;
    let burstTimes = processes.map(p => p.burstTime);
    let results = Array(n).fill(null).map(() => ({}));
    let startTimes = Array(n).fill(-1); // To track the start times of processes
    let arrivalQueue = processes.slice().sort((a, b) => a.arrivalTime - b.arrivalTime);
    let segments = []; // To store Gantt chart segments
    let colors = ['#8cd76f', '#1e88e5']; // Alternating colors for processes

    while (completed !== n) {
        let idx = -1;
        let minTime = Infinity;

        // Find the process with the shortest remaining burst time among arrived processes
        for (let i = 0; i < n; i++) {
            if (processes[i].arrivalTime <= currentTime && burstTimes[i] > 0 && burstTimes[i] < minTime) {
                minTime = burstTimes[i];
                idx = i;
            }
        }

        if (idx === -1) {
            // If no process is available to execute, move time forward to the next process's arrival time
            currentTime = arrivalQueue[0] ? Math.max(currentTime, arrivalQueue[0].arrivalTime) : currentTime + 1;
            continue;
        }

        // Record the start time for the process if it's the first time it's running
        if (startTimes[idx] === -1) {
            startTimes[idx] = currentTime;
        }

        // Create a segment for the Gantt chart
        segments.push({
            processId: processes[idx].id,
            start: currentTime,
            end: currentTime + 1,
            color: colors[idx % 2]
        });

        burstTimes[idx]--;
        currentTime++;

        if (burstTimes[idx] === 0) {
            completed++;
            results[idx] = {
                processId: processes[idx].id,
                startTime: startTimes[idx],
                completionTime: currentTime,
                turnaroundTime: currentTime - processes[idx].arrivalTime,
                waitingTime: currentTime - processes[idx].arrivalTime - processes[idx].burstTime,
            };
        }
    }

    // Return results and Gantt chart segments
    return { results, ganttChart: generateGanttChartSegments(segments) };
};
