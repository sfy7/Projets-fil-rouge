// =============================================================================
// MIDDLEWARE PROMETHEUS pour Express.js
// =============================================================================
// Installation : npm install prom-client
// Usage dans app.js :
//   const { metricsMiddleware, metricsEndpoint } = require('./metrics');
//   app.use(metricsMiddleware);
//   app.get('/metrics', metricsEndpoint);
// =============================================================================

const client = require('prom-client');

const register = new client.Registry();

// Métriques par défaut Node.js (heap, event loop, GC, etc.)
client.collectDefaultMetrics({ register, prefix: 'nodejs_' });

// ---------- MÉTRIQUES CUSTOM ----------

// Compteur de requêtes HTTP totales
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogramme de durée des requêtes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Gauge requêtes en cours
const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Nombre de requêtes HTTP en cours de traitement',
  registers: [register],
});

// Gauge connexions MongoDB actives
const mongoConnections = new client.Gauge({
  name: 'mongodb_connections_active',
  help: 'Nombre de connexions MongoDB actives',
  registers: [register],
});

// ---------- MIDDLEWARE ----------

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next();

  const start = process.hrtime.bigint();
  httpRequestsInProgress.inc();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route,
      status: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    httpRequestsInProgress.dec();
  });

  next();
}

// ---------- ENDPOINT /metrics ----------

async function metricsEndpoint(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  mongoConnections,
  register,
};
