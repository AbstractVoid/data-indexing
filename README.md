# Data Indexing Technical Assessment

## Local Setup

### Prerequisites:

Ensure Node.js is installed. This project requires Node.js v14.0.0 or above.

### Running the code:
Clone the repository: `git clone https://github.com/AbstractVoid/data-indexing.git`

Navigate into the project directory: `cd data-indexing`

Install dependencies: 

```
npm install
```

To run the script on accounts.json: 

```
npm run main
```

Running the tests:

```
npm test
```

## Design Patterns
The application uses Node.js for its effective asynchronous operations handling and TypeScript for robustness and maintainability.

The design patterns chosen for this project were primarily driven by the need to handle concurrency and asynchronous operations.

Promise Chaining: When multiple updates for the same account arrive in an asynchronous manner, Promise chaining ensures that they are processed in the order they arrive. Concurrent updates are handled carefully to prevent simultaneous modification of the `accountUpdates` variable, maintaining data integrity.

Singleton Pattern for the Manager Class: The manager class is designed as a singleton to ensure a single source of truth for account updates.

Event-driven Programming: Event-driven programming is used to emit events after processing each update. This is particularly useful for testing and could also be used for triggering other actions in a larger system.

The design patterns used, as well as the overall structure of the code and data, are flexible and can be adjusted to fit the larger project's needs. Depending on additional requirements or use cases for the data, the data structures may need to evolve. The project has been developed based on the short requirements given and limited knowledge of what it will evolve into or how it connects to other parts of the backend.


## Observability and Monitoring for Production Rollout

The specific tools or libraries used for observability and monitoring would depend on the technology stack or infrastructure in use. However, we would want to ensure comprehensive logging of errors and key events, and regular reporting of critical metrics (such as system performance and resource usage).

On a high level, we would monitor system performance (response times, throughput), resource usage (CPU, memory, disk space, network I/O), and error rates. Alerts could be set up for when specific thresholds meet or exceed expected values for various metrics.