import { Parking } from '../entities/parking.entity';
import { ParkingRepository } from '../repositories/parking.repository';
import { CreateParkingDto, UpdateParkingDto } from '../dtos/parking.dto';
import { AppError } from '../utils/error';

export class ParkingService {
  constructor(private parkingRepository: ParkingRepository) {}

  async createParking(createParkingDto: CreateParkingDto): Promise<Parking> {
    if (createParkingDto.spots < 50) {
      throw new AppError('Parking is too small. Minimum spots: 50', 400);
    }

    if (createParkingDto.spots > 1500) {
      throw new AppError('Parking is too large. Maximum spots: 1500', 400);
    }

    // Verify unique name
    const existingParking = await this.parkingRepository.findByName(createParkingDto.name);
    if (existingParking) {
      throw new AppError('Parking name already exists', 400);
    }

    // Create new entity
    const parking = new Parking();
    parking.name = createParkingDto.name;
    parking.contact = createParkingDto.contact;
    parking.spots = createParkingDto.spots;
    
    parking.parkingType = createParkingDto.parkingType;

    return this.parkingRepository.save(parking);
  }

  async getAllParkings(
  skip: number,
  limit: number,
  order: 'asc' | 'desc',
  orderBy: string
  ) {
    const offset = skip * limit;
    
    const [data, totalItems] = await this.parkingRepository.findAllPaginated(
      offset,
      limit,
      order,
      orderBy
    );

    return { totalItems, data };
  }

  async updateParking(id: string, updateParkingDto: UpdateParkingDto): Promise<Parking> {
    const parking = await this.parkingRepository.findById(id);
    if (!parking) {
      throw new AppError('Parking not found', 404);
    }

    if (updateParkingDto.contact !== undefined) {
      parking.contact = updateParkingDto.contact;
    }

    if (updateParkingDto.spots !== undefined) {
      if (updateParkingDto.spots < 50 || updateParkingDto.spots > 1500) {
        throw new AppError('Spots must be between 50 and 1500', 400);
      }
      parking.spots = updateParkingDto.spots;
    }

    parking.updatedAt = new Date ();

    return this.parkingRepository.save(parking);
  }

  async getParkingById(id: string): Promise<Parking> {
    const parking = await this.parkingRepository.findById(id);
    if (!parking) {
      throw new AppError('Parking not found', 404);
    }
    return parking;
  }
}