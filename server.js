const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const config = require('./src/config');
const publicRoutes = require('./src/routes-public');
const adminRoutes = require('./src/routes-admin');
const applyRoutes = require('./src/routes-apply');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'", "'unsafe-inline'"],   // index.html'da inline script bor
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https:'],
      'connect-src': ["'self'"]
    }
  }
}));
app.use(cookieParser());

// ---------- API ----------
app.use('/api/apply', applyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Topilmadi' }));

// ---------- Statik sayt ----------
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: config.isProd ? '1h' : 0
}));

// ---------- Xatolarni ushlash ----------
app.use((err, req, res, next) => {
  console.error('[xato]', err);
  if (res.headersSent) return next(err);
  if (req.path.startsWith('/api')) return res.status(500).json({ error: 'Server xatosi. Keyinroq qayta urinib ko\'ring.' });
  res.status(500).send('Server xatosi');
});

app.listen(config.port, () => {
  console.log(`Op_Team sayti: http://localhost:${config.port}`);
});
