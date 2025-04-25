import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import parkingRouter from './routes/parking.routes';
import checkInRouter from './routes/checkin.routes';


const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// REST Routes
app.use('/auth', authRoutes);
app.use('/parkings', parkingRouter);
app.use('/check-in', checkInRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
