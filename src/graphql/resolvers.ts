import { CheckInService } from '../services/checkin.service';
import { ParkingService } from '../services/parking.service';
import { CheckInFactory } from '../factories/checkin.factory';
import { CheckInRepository } from '../repositories/checkin.repository';
import { ParkingRepository } from '../repositories/parking.repository';
import { UserType } from '../entities/checkin.entity';

const parkingService = new ParkingService(new ParkingRepository());
const checkInService = new CheckInService(parkingService, new CheckInRepository());

export const resolvers = {
  Mutation: {
    checkIn: async (
      _: any,
      { parkingId, userType }: { parkingId: string; userType: string },
      context: { user: { id: string } }
    ) => {
      const userId = context.user?.id;

      if (!userId) {
        return {
          success: false,
          message: 'Unauthorized',
          errorCode: 'UNAUTHORIZED',
        };
      }

      const userTypeEnum = userType as UserType;

      const parking = await parkingService.getParkingById(parkingId);
      if (!parking) {
        return {
          success: false,
          message: 'Parking not found',
          errorCode: 'PARKING_NOT_FOUND',
        };
      }

      const parkingValidator = CheckInFactory.createParking(parking.parkingType);
      const validationResult = parkingValidator.canUserEnter(userTypeEnum);

      if (!validationResult.canEnter) {
        return {
          success: false,
          message: validationResult.message,
          errorCode: 'ACCESS_DENIED',
        };
      }

      try {
        await checkInService.handleCheckIn({
          parkingId,
          userType: userTypeEnum,
          userId,
        });

        return {
          success: true,
          message: 'Access granted',
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            message: error.message,
            errorCode: 'INTERNAL_ERROR',
          };
        }
        return {
          success: false,
          message: 'Unknown error occurred',
          errorCode: 'UNKNOWN_ERROR',
        };
      }
    },
  },
};
