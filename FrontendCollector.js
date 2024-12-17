class FrontendCollector {
    constructor({ collectorURL = "http://localhost:7071", batchSize = 50, flushInterval = 30000, sampleRate = 1.0, debug = false }) {
        this.collectorURL = collectorURL;
        this.batchSize = batchSize;
        this.flushInterval = flushInterval;
        this.sampleRate = sampleRate;
        this.debug = debug;
        this.queue = [];
        this.maxQueueSize = 1000;
        this.isFlushing = false;

        this.startWorker();
        this.wrapNetworkCalls();
    }

    // log(message, data = null) {
    //     if (this.debug) {
    //         console.log(`[FrontendCollector] ${message}`, data);
    //     }
    // }

    shouldSample() {
        return Math.random() < this.sampleRate;
    }

    startWorker() {
        setInterval(() => {
            if (this.queue.length > 0) {
                this.flushQueue();
            }
        }, this.flushInterval);
    }

    wrapNetworkCalls() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const start = Date.now()/1000;
            const response = await originalFetch(...args);
            const duration = Date.now()/1000 - start;

            response.clone().json().then((body) => {
                const event = {
                    method: args[1]?.method || 'GET',
                    url: args[0],
                    headers: args[1]?.headers || {},
                    requestBody: args[1]?.body || {},
                    responseBody: body,
                    status: response.status,
                    duration_ms: duration,
                    timestamp: start
                };
                this.capture(event);
            });

            return response;
        };
    }

    capture(event) {
        if (!this.shouldSample()) {
            return;
        }
        if (this.queue.length >= this.maxQueueSize) {
            // this.log('Queue is full, dropping event');
            return;
        }
        this.queue.push(event);
        // this.log('Event captured', event);
    }

    flushQueue() {
        if (this.isFlushing) return;
        this.isFlushing = true;
        const batch = this.queue.splice(0, this.batchSize);

        fetch(this.collectorURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: batch })
        }).then(() => {
            this.isFlushing = false;
            // this.log('Batch successfully sent');
        }).catch((err) => {
            this.queue.unshift(...batch);
            this.isFlushing = false;
            // this.log('Error sending batch', err);
        });
    }

    stop() {
        this.flushQueue();
    }
}

module.exports = FrontendCollector;
