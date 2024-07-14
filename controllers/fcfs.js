module.exports = function fcfs(processes) {
    // Sort processes by arrival time
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
    let currentTime = 0;
    let results = [];
  
    for (const process of processes) {
      let startTime = Math.max(currentTime, process.arrivalTime); // Process can start when it arrives or after the previous process
      let completionTime = startTime + process.burstTime;
      let turnaroundTime = completionTime - process.arrivalTime;
      let waitingTime = startTime - process.arrivalTime;
  
      // Handle case where process arrives before previous process has completed
      if (startTime > currentTime) {
        currentTime = startTime;
      }
  
      results.push({
        processId: process.id,
        startTime: startTime,
        completionTime: completionTime,
        turnaroundTime: turnaroundTime,
        waitingTime: waitingTime,
      });
  
      // Update the current time
      currentTime = completionTime;
    }
  
    return results;
  };