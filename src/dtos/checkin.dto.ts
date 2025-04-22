import Joi from 'joi';
import { UserType } from '../entities/checkin.entity';

export interface CreateCheckInDto {
  userId: string;
  parkingId: string;
  userType: UserType;
}

export const createCheckInSchema = Joi.object<CreateCheckInDto>({
  parkingId: Joi.string().required(),
  userType: Joi.string().valid('corporate', 'provider', 'visitor').required()
}).strict();

export interface UpdateParkingDto {
  userId?: string;
  parkingId?: string;
  userType?: string;
}
