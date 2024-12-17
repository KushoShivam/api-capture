class Middleware {
    static WSGIMiddleware(app, collector, urlPatterns = ['']) {
        return (req, res, next) => {
            const path = req.path || req.url;
            const shouldCapture = urlPatterns.some(pattern => path.includes(pattern));

            if (!shouldCapture) {
                return next();
            }

            const start = Date.now()/1000;

            const originalEnd = res.end;
            res.end = function (...args) {
                const duration = Date.now()/1000 - start;

                const urlObj = new URL(req.url, `http://${req.headers.host}`);

                const event = {
                    timestamp: start,
                    path,
                    method: req.method,
                    headers: req.headers,
                    queryParams: Object.fromEntries(urlObj.searchParams),
                    requestBody: req.body,
                    status: res.statusCode,
                    duration_ms: duration,
                };

                collector.capture(event);
                originalEnd.apply(this, args);
            };

            next();
        };
    }

    static ASGIMiddleware(app, collector, urlPatterns = ['/api/']) {
        return async (ctx, next) => {
            const path = ctx.path || ctx.request.url;
            const shouldCapture = urlPatterns.some(pattern => path.includes(pattern));

            if (!shouldCapture) {
                return next();
            }

            const start = Date.now()/1000;

            await next();

            const duration = Date.now()/1000 - start;
            const event = {
                timestamp: start,
                path,
                method: ctx.method,
                headers: ctx.headers,
                queryParams: ctx.query,
                requestBody: ctx.request.body,
                status: ctx.status,
                duration_ms: duration,
            };

            collector.capture(event);
        };
    }
}

module.exports = Middleware;