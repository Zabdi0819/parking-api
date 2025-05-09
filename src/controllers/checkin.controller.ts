import { Request, Response } from 'express';
import { ParkingService } from '../services/parking.service';
import { CheckInFactory } from '../factories/checkin.factory';
import { CheckInService } from '../services/checkin.service';
import { User } from '../entities/user.entity';

export class CheckInController {
  constructor(
    private parkingService: ParkingService,
    private checkInService: CheckInService
  ) {}

  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { parkingId, userType } = req.body;

      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const userId = (req.user as User)?.id;

      const parking = await this.parkingService.getParkingById(parkingId);
      if (!parking) {
        res.status(404).json({ message: 'Parking not found' });
        return;
      }

      const parkingValidation = CheckInFactory.createParking(parking.parkingType);
      const validationResult = parkingValidation.canUserEnter(userType);

      await this.checkInService.handleCheckIn({ parkingId, userType, userId });

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
