import { Repository } from 'typeorm';
import  AppDataSource from '../config/data-source';
import { CheckIn } from '../entities/checkin.entity';

export class CheckInRepository {
  private repository: Repository<CheckIn>;

  constructor() {
    this.repository = AppDataSource.getRepository(CheckIn);
  }

  async save(checkIn: CheckIn): Promise<CheckIn> {
    return this.repository.save(checkIn);
  }
}