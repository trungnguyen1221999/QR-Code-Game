import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import checkpointRoutes from './routes/checkpointRoutes.js';
import minigameRoutes from './routes/minigameRoutes.js';
import hostRoutes from './routes/hostRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import playerSessionRoutes from './routes/playerSessionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { connectDB1, connectDB2 } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/minigames', minigameRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/player-sessions', playerSessionRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'QR Code Game Backend API' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB1();
  await connectDB2();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;
