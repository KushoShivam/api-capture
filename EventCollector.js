class EventCollector {
    constructor({
        collectorURL = 'http://localhost:7071', 
        batchSize = 100, 
        flushInterval = 60000, 
        maxQueueSize = 10000, 
        sampleRate = 1.0,
        debug = true
    }) {
        this.collectorURL = collectorURL.replace(/\/$/, '');
        this.batchSize = batchSize;
        this.flushInterval = flushInterval;
        this.sampleRate = sampleRate;
        this.queue = [];
        this.maxQueueSize = maxQueueSize;
        this.isFlushing = false;
        this.debug = debug;
        this.startWorker();
    }

    // Detailed logging method
    // log(message, data = null) {
    //     if (this.debug) {
    //         console.log(`[EventCollector] ${message}`, data ? data : '');
    //     }
    // }

    shouldSample() {
        const shouldCapture = Math.random() < this.sampleRate;
        // this.log(`Sampling decision: ${shouldCapture}`);
        return shouldCapture;
    }

    startWorker() {
        // this.log('Starting event collection worker');
        this.intervalId = setInterval(() => {
            if (this.queue.length > 0) {
                this.flushQueue();
            }
        }, this.flushInterval);
    }

    async flushQueue() {
        if (this.isFlushing || this.queue.length === 0) {
            // this.log('Skipping flush - already flushing or queue empty');
            return;
        }

        this.isFlushing = true;
        const batch = this.queue.splice(0, this.batchSize);

        // this.log(`Flushing batch of ${batch.length} events`);

        try {
            await this.sendBatch(batch);
        } catch (error) {
            // this.log('Error sending batch', error);
            // Restore events to queue if send fails
            this.queue.unshift(...batch);
        } finally {
            this.isFlushing = false;
        }
    }


    async sendBatch(batch) {
        const payload = JSON.stringify({ events: batch });
        
        // Use fetch for browser and Node.js environments
        const response = await fetch(`${this.collectorURL}/api/v1/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other necessary headers here
            },
            body: payload,
        });

        if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(`HTTP Error: ${response.status} - ${responseBody}`);
        }

        // this.log(`Successfully sent batch of ${batch.length} events`);

        // return new Promise((resolve, reject) => {
        //     const parsedUrl = url.parse(this.collectorURL);
            
        //     const options = {
        //         hostname: parsedUrl.hostname,
        //         port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        //         path: `${parsedUrl.path}api/v1/events`,
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         }
        //     };

        //     // this.log('Sending batch to URL', options);

        //     const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        //         let responseBody = '';

        //         res.on('data', (chunk) => {
        //             responseBody += chunk;
        //         });

        //         res.on('end', () => {
        //             // this.log(`Response status: ${res.statusCode}`);
        //             // this.log(`Response body: ${responseBody}`);

        //             if (res.statusCode >= 200 && res.statusCode < 300) {
        //                 resolve();
        //             } else {
        //                 resolve();
        //                 reject(new Error(`HTTP Error: ${res.statusCode} - ${responseBody}`));
        //             }
        //         });
        //     });

        //     req.on('error', (error) => {
        //         // this.log('Network error', error);
        //         resolve();
        //         reject(error);
        //     });

        //     req.write(JSON.stringify({ events: batch }));
        //     req.end();
        // });
    }

    capture(event) {
        // Always log captured events in debug mode
        // this.log('Capturing event', event);

        // If sampling is disabled or event fails sampling, still log
        if (!this.shouldSample()) {
            // this.log('Event did not pass sampling');
            return;
        }

        if (this.queue.length >= this.maxQueueSize) {
            // this.log('Queue is full, dropping event');
            return;
        }

        this.queue.push(event);
        // this.log(`Event queued. Current queue size: ${this.queue.length}`);
    }

    // Optional method to manually flush queue
    forceFlush() {
        // this.log('Forcing queue flush');
        this.flushQueue();
    }

    // Cleanup method
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        // Force a final flush
        this.flushQueue();
    }
}

module.exports = EventCollector;