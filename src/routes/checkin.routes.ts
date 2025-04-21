import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller';
import { ParkingService } from '../services/parking.service';
import { ParkingRepository } from '../repositories/parking.repository';

const router = Router();
const parkingRepository = new ParkingRepository();
const parkingService = new ParkingService(parkingRepository);
const checkInController = new CheckInController(parkingService);

router.post('/', (req, res) => checkInController.checkIn(req, res));

export default router;