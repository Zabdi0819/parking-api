import { Request, Response } from 'express';
import { ParkingService } from '../services/parking.service';
import { ParkingFactory } from '../factories/parking.factory';
import { ParkingType } from '../entities/parking.entity';

export class CheckInController {
  constructor(private parkingService: ParkingService) {}

  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { parkingId, userType } = req.body;
      
      const parking = await this.parkingService.getParkingById(parkingId);
      if (!parking) {
        res.status(404).json({ message: 'Parking not found' });
        return;
      }
      
      const parkingValidation = ParkingFactory.createParking(parking.parkingType);
      const validationResult = parkingValidation.canUserEnter(userType);
      
      if (!validationResult.canEnter) {
        res.status(403).json({
          status: 'error',
          errorCode: 'ACCESS_DENIED',
          message: validationResult.message,
        });
        return;
      }
      
      res.json({
        status: 'success',
        message: 'Access granted',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }
}