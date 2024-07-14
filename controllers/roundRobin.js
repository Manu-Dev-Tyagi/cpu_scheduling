module.exports = function roundRobin(processes, quantum) {
    // Input validation
    if (!Array.isArray(processes) || typeof quantum !== 'number') {
        throw new Error('Invalid input: processes must be an array and quantum must be a number');
    }

    if (processes.some(process => typeof process.id !== 'number' || typeof process.arrivalTime !== 'number' || typeof process.burstTime !== 'number')) {
        throw new Error('Invalid input: processes must have id, arrivalTime, and burstTime properties');
    }

    if (quantum <= 0) {
        throw new Error('Invalid input: quantum must be a positive number');
    }

    // Initialize variables
    let queue = [];
    let currentTime = 0;
    let results = [];
    let processStartTimes = new Map();
    let arrivalQueue = processes.map(process => ({
        ...process,
        remainingTime: process.burstTime
    })).sort((a, b) => a.arrivalTime - b.arrivalTime);

    // Function to add new processes to the queue based on the current time
    const addNewArrivalsToQueue = () => {
        while (arrivalQueue.length > 0 && arrivalQueue[0].arrivalTime <= currentTime) {
            let newProcess = arrivalQueue.shift();
            queue.push(newProcess);
        }
    };

    // Ensure initial processes are added to the queue
    addNewArrivalsToQueue();

    while (queue.length > 0) {
        let process = queue.shift();

        // If process is just starting, record its start time
        if (!processStartTimes.has(process.id)) {
            processStartTimes.set(process.id, currentTime);
        }

        if (process.remainingTime > quantum) {
            currentTime += quantum;
            process.remainingTime -= quantum;
            addNewArrivalsToQueue();
            queue.push(process);
        } else {
            currentTime += process.remainingTime;
            process.remainingTime = 0;
            
            results.push({
                processId: process.id,
                startTime: processStartTimes.get(process.id),
                completionTime: currentTime,
                turnaroundTime: currentTime - process.arrivalTime,
                waitingTime: currentTime - process.arrivalTime - process.burstTime,
            });

            addNewArrivalsToQueue();
        }

        // If the queue is empty and there are still processes in the arrivalQueue, fast-forward time
        if (queue.length === 0 && arrivalQueue.length > 0) {
            currentTime = arrivalQueue[0].arrivalTime;
            addNewArrivalsToQueue();
        }
    }

    return results;
};
