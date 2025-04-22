import Joi from 'joi';
import { UserType } from '../entities/checkin.entity';
import { User } from '../entities/user.entity';

export interface CreateCheckInDto {
  parkingId: User['id'];
  userType: UserType;
}

export const createCheckInSchema = Joi.object<CreateCheckInDto>({
  parkingId: Joi.string().required(),
  userType: Joi.string().valid('corporate', 'provider', 'visitor').required()
}).strict();

export interface UpdateParkingDto {
  parkingId?: User;
  userType?: string;
}
