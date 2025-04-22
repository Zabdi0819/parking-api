import { CheckIn } from '../entities/checkin.entity';
import { User } from '../entities/user.entity';
import { ParkingService } from './parking.service';
import { CheckInFactory } from '../factories/checkin.factory';
import { AppError } from '../utils/error';
import { CheckInRepository } from '../repositories/checkin.repository';
import { CreateCheckInDto } from '../dtos/checkin.dto';
import { Parking } from '../entities/parking.entity';

export class CheckInService {
  constructor(
    private parkingService: ParkingService,
    private checkInRepository: CheckInRepository
  ) {}

  async handleCheckIn(dto: CreateCheckInDto): Promise<CheckIn> {
    const parking: Parking = await this.parkingService.getParkingById(dto.parkingId);

    if (!parking) {
      throw new AppError('Parking not found', 404);
    }

    const parkingValidator = CheckInFactory.createParking(parking.parkingType);
    const validation = parkingValidator.canUserEnter(dto.userType);

    const checkIn = new CheckIn();
    checkIn.parking = parking;
    checkIn.user =  { id: dto.userId } as User;
    checkIn.userType = dto.userType;
    checkIn.accessGranted = validation.canEnter;
    checkIn.reason = validation.message;

    return this.checkInRepository.save(checkIn);
  }
}
