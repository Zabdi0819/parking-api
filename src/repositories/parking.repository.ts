import { Repository } from 'typeorm';
import  AppDataSource from '../config/data-source';
import { Parking } from '../entities/parking.entity';

export class ParkingRepository {
  private repository: Repository<Parking>;

  constructor() {
    this.repository = AppDataSource.getRepository(Parking);
  }

  async findByName(name: string): Promise<Parking | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findById(id: string): Promise<Parking | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(parking: Parking): Promise<Parking> {
    return this.repository.save(parking);
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    order: 'asc' | 'desc',
    orderBy: string
  ): Promise<[Parking[], number]> {
    return this.repository.findAndCount({
      skip,
      take: limit,
      order: { [orderBy]: order.toUpperCase() }
    });
  }
}