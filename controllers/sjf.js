module.exports = function sjf(processes) {
    // Input validation
    if (!Array.isArray(processes)) {
        throw new Error('Invalid input: processes must be an array');
    }

    if (processes.some(process => typeof process.id !== 'number' || typeof process.arrivalTime !== 'number' || typeof process.burstTime !== 'number')) {
        throw new Error('Invalid input: processes must have id, arrivalTime, and burstTime properties');
    }

    // Sort processes based on arrival time initially
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    let results = [];
    let remainingProcesses = processes.slice();

    while (remainingProcesses.length > 0) {
        // Filter out processes that have arrived
        let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);

        if (availableProcesses.length > 0) {
            // Sort available processes by burst time
            availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
            let process = availableProcesses.shift();

            // Calculate times
            let startTime = currentTime;
            currentTime += process.burstTime;

            results.push({
                processId: process.id,
                startTime: startTime,
                completionTime: currentTime,
                turnaroundTime: currentTime - process.arrivalTime,
                waitingTime: startTime - process.arrivalTime,
            });

            // Remove the executed process from the remaining processes
            remainingProcesses = remainingProcesses.filter(p => p.id !== process.id);
        } else {
            // If no process is available to execute, move time forward to the next process's arrival time
            currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
        }
    }

    return results;
};
