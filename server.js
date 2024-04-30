const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('./config/passport');
const http = require('http');
const WebSocket = require('ws');

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

const allowedOrigins = ['http://localhost:3001', 'http://34.74.39.8:3005', 'http://101.188.67.134:3005','http://192.168.50.177:3005', 'http://localhost:3000', 'http://34.165.92.44', 'http://192.168.56.1:3000', 'http://172.21.84.245:3000', 'http://172.21.85.77:3000', 'http://172.21.85.123:3005', 'http://172.20.80.1:3000', 'http://localhost:3005'];

// Crear el servidor HTTP
const server = http.createServer(app);

// Crear el servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message);
  });

});

const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes')(wss);
const dashboardRoutes = require('./routes/dashboardRoutes'); // Agrega el enrutador del dashboard
const horoscopeRoutes = require('./routes/horoscopeRoutes')(wss);  // Asegúrate de que la ruta sea correcta
const lottopega3Routes = require('./routes/LottoRoutes')(wss);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS para este sitio no permite el acceso desde el origen especificado.DariendGay';
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
app.use('/api/lottopega3', lottopega3Routes);

// Usa Passport para la autenticación
app.use(passport.initialize()); 

// Agrega el enrutador del dashboard
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});