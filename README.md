# Kusho Capture

**Kusho Capture** is a lightweight SDK to monitor and log API traffic across various JavaScript frameworks like **Node.js**, **React**, **NestJS**, **Electron**, and more. It can be easily integrated into existing codebases to collect, batch, and send API event data to a backend for further analysis.

---

## Features

- **Framework Agnostic**: Works seamlessly across Node.js, React, NestJS, Electron, etc.
- **Event Collection**: Tracks request and response metadata, including headers, body, and query parameters.
- **Batching and Sampling**: Sends data in configurable batches with support for sampling to avoid excessive load.
- **Asynchronous Processing**: Background processing ensures minimal impact on application performance.

---

## Installation
```bash
npm install kusho-capture
```

---

## Usage

### Middleware Example (Express.js)

```javascript
const express = require('express');
const { Middleware, EventCollector } = require('kusho-capture');

const app = express();
const collector = new EventCollector({
    collectorURL: 'https://your-backend-url.com',
    batchSize: 50,
    flushInterval: 30000,
    sampleRate: 0.2,
});

app.use(Middleware.WSGIMiddleware(app, collector, ['/api']));

app.get('/api/example', (req, res) => {
    res.json({ message: 'API Capture Example' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
```

### React.js Example

```typescript
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FrontendCollector } from 'kusho-capture';

// Configure the frontend collector
const apiCollector = new FrontendCollector({
    collectorURL: 'https://your-backend-analytics.com/capture',
    batchSize: 25,
    flushInterval: 15000,
    sampleRate: 0.5
});

const UserProfileComponent = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Wrap axios call with event collection
                const response = await apiCollector.capture(
                    () => axios.get('/api/user-profile'),
                    {
                        metadata: {
                            componentName: 'UserProfileComponent',
                            timestamp: new Date().toISOString()
                        }
                    }
                );
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user profile', error);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div>
            {userData ? (
                <h1>Welcome, {userData.name}</h1>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default UserProfileComponent;
```

---

## Configuration Options (EventCollector)

| Option          | Type     | Default      | Description                                          |
|------------------|----------|--------------|------------------------------------------------------|
| `collectorURL`   | `string` | **Required** | The backend endpoint where events are sent.         |
| `batchSize`      | `number` | `100`        | Number of events to batch together before sending.  |
| `flushInterval`  | `number` | `60000`      | Time (ms) between automatic batch flushes.          |
| `maxQueueSize`   | `number` | `10000`      | Maximum number of events stored in the queue.       |
| `sampleRate`     | `number` | `0.1`        | Fraction of requests to capture (0.0 to 1.0).       |

---

## Framework Integration

### React.js
Use `EventCollector.capture()` method to wrap API calls and automatically collect telemetry.

### NestJS
Add the middleware globally or for specific routes.

### Electron
Wrap HTTP or WebSocket calls with event capture logic.

---

## Development

### Project Setup

Clone the repository and set up the development environment:

```bash
# Clone the repository
git clone https://github.com/your-username/kusho-capture.git
cd kusho-capture

# Install dependencies
npm install

# Link the package locally
npm link
```

### Development Workflow

1. **Local Development**
   ```bash
   # Run TypeScript compiler in watch mode
   npm run watch

   # Run tests
   npm test

   # Lint code
   npm run lint
   ```

2. **Example Projects**
   ```bash
   # Navigate to example directory
   cd examples

   # Set up example projects for different frameworks
   npm run setup:react
   npm run setup:express
   npm run setup:electron
   ```

3. **Build and Publish**
   ```bash
   # Build the package
   npm run build

   # Publish to npm (requires npm account)
   npm publish
   ```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing Strategies

- Unit tests for individual components
- Integration tests for framework compatibility
- Performance benchmarks
- Edge case handling

---

## Contact

For issues, support, or contributions, please open an issue on my [GitHub Repository](https://github.com/KushoShivam/kusho-capture).