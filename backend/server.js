const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('./config/passport');
const http = require('http');
const WebSocket = require('ws');
const path = require('path'); // Asegúrate de importar 'path'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

const allowedOrigins = ['http://localhost:3001', 'http://192.168.50.178:3005', 'https://loteria.zipply.app', 'https://loteriasdepanama-716c76966e8e.herokuapp.com', 'http://localhost:3000', 'http://34.165.92.44', 'http://192.168.56.1:3000', 'http://172.21.84.245:3000', 'http://172.21.85.77:3000', 'http://172.21.85.123:3005', 'http://172.20.80.1:3000', 'http://localhost:3005'];

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Intervalo para verificar la conexión
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Ping cada 30 segundos

// Limpieza en el cierre del servidor
server.on('close', function close() {
  clearInterval(interval);
});

const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes')(wss);
const dashboardRoutes = require('./routes/dashboardRoutes');
const horoscopeRoutes = require('./routes/horoscopeRoutes')(wss);
const lottopega3Routes = require('./routes/LottoRoutes')(wss);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS para este sitio no permite el acceso desde el origen especificado.';
      console.log('Error:', msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/lotto', lottopega3Routes);
app.use(passport.initialize());
app.use('/dashboard', dashboardRoutes);

// Middleware para servir archivos estáticos del frontend de React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Todas las rutas no manejadas se redirigen al frontend de React
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
