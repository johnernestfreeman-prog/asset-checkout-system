import express from 'express';
import authRoutes from './routes/authRoutes';
import assetRoutes from './routes/assetRoutes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Asset Checkout System API running.' });
});

app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);

export default app;