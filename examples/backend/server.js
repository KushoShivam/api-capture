const express = require('express');
const bodyParser = require('body-parser');
const { Middleware, EventCollector } = require('api-capture');

// Create an event collector
const collector = new EventCollector({
    collectorURL: 'http://localhost:7071', // Assuming a separate event collection service
    batchSize: 50,
    flushInterval: 30000, // 30 seconds
    sampleRate: 0.5 // Capture 50% of events
});

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(Middleware.WSGIMiddleware(app, collector, ['/api/']));

// Sample routes
app.get('/api/users', (req, res) => {
    res.json({
        users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ]
    });
});

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    res.status(201).json({
        message: 'User created',
        user: newUser
    });
});

// Non-captured route
app.get('/public/info', (req, res) => {
    res.json({ status: 'public information' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Event collection middleware is active');
});