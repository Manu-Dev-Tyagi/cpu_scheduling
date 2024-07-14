module.exports = function mlfq(processes, queues) {
    // Input validation
    if (!Array.isArray(processes) || !Array.isArray(queues)) {
        throw new Error('Invalid input: processes and queues must be arrays');
    }

    if (processes.some(process => typeof process.id !== 'number' || typeof process.arrivalTime !== 'number' || typeof process.burstTime !== 'number')) {
        throw new Error('Invalid input: processes must have id, arrivalTime, and burstTime properties');
    }

    if (queues.some(queue => typeof queue.timeQuantum !== 'number')) {
        throw new Error('Invalid input: queues must have timeQuantum property');
    }

    // Initialize variables
    let currentTime = 0;
    let results = [];
    let arrivalQueue = processes.map(process => ({
        ...process,
        remainingTime: process.burstTime
    }));
    let queueConfigurations = queues.map(queue => ({
        ...queue,
        processes: []
    }));

    // Function to move processes from arrival queue to appropriate MLFQ queue
    const moveProcessesToQueues = () => {
        for (let i = 0; i < arrivalQueue.length; i++) {
            if (arrivalQueue[i].arrivalTime <= currentTime) {
                queueConfigurations[0].processes.push(arrivalQueue[i]);
                arrivalQueue.splice(i, 1);
                i--;
            }
        }
    };

    // Ensure arrival queue is sorted by arrival time
    arrivalQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);

    moveProcessesToQueues();

    while (arrivalQueue.length > 0 || queueConfigurations.some(queue => queue.processes.length > 0)) {
        let allQueuesEmpty = true;
        for (let queue of queueConfigurations) {
            while (queue.processes.length > 0) {
                allQueuesEmpty = false;
                let process = queue.processes.shift();
                let executionTime = Math.min(queue.timeQuantum, process.remainingTime);
                process.remainingTime -= executionTime;
                currentTime += executionTime;

                moveProcessesToQueues();

                if (process.remainingTime > 0) {
                    let nextQueueIndex = queueConfigurations.indexOf(queue) + 1;
                    if (nextQueueIndex < queueConfigurations.length) {
                        queueConfigurations[nextQueueIndex].processes.push(process);
                    } else {
                        queue.processes.push(process);
                    }
                } else {
                    results.push({
                        processId: process.id,
                        startTime: currentTime - executionTime,
                        completionTime: currentTime,
                        turnaroundTime: currentTime - process.arrivalTime,
                        waitingTime: currentTime - process.arrivalTime - process.burstTime,
                    });
                }
            }
        }
        if (allQueuesEmpty) {
            currentTime++;
            moveProcessesToQueues();
        }
    }

    return results;
};
