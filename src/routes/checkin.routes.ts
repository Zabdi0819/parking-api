import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller';
import { ParkingService } from '../services/parking.service';
import { CheckInService } from '../services/checkin.service';
import { ParkingRepository } from '../repositories/parking.repository';
import { CheckInRepository } from '../repositories/checkin.repository';
import { authenticateJWT } from '../middlewares/auth.middleware'; // 💡 importalo aquí

const router = Router();
const parkingRepository = new ParkingRepository();
const checkInRepository = new CheckInRepository();
const parkingService = new ParkingService(parkingRepository);
const checkInService = new CheckInService(parkingService, checkInRepository);
const checkInController = new CheckInController(parkingService, checkInService);

router.post('/', authenticateJWT, (req, res) => checkInController.checkIn(req, res));

export default router;
