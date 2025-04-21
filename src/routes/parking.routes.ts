import { Router } from 'express';
import { ParkingController } from '../controllers/parking.controller';
import { ParkingService } from '../services/parking.service';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { ParkingRepository } from '../repositories/parking.repository';

const router = Router();

const parkingRepository = new ParkingRepository();
const parkingService = new ParkingService(parkingRepository);
const parkingController = new ParkingController(parkingService);

router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    await parkingController.createParking(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    await parkingController.getAllParkings(req, res);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticateJWT, async (req, res, next) => {
  try {
    await parkingController.updateParking(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
