import Joi from 'joi';
import { ParkingType } from '../entities/parking.entity';

const PHONE_REGEX = /^\+?\d{3,15}$/;

export interface CreateParkingDto {
  name: string;
  contact: string;
  spots: number;
  parkingType: ParkingType;
}

export const createParkingSchema = Joi.object<CreateParkingDto>({
  name: Joi.string().required().min(3).max(100),
  contact: Joi.string()
    .required()
    .max(15)
    .pattern(PHONE_REGEX, 'valid phone number')
    .messages({
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
  spots: Joi.number().integer().min(50).max(1500).required(),
  parkingType: Joi.string().valid('public', 'private', 'courtesy').required()
}).strict();

export interface UpdateParkingDto {
  contact?: string;
  spots?: number;
}

export const updateParkingSchema = Joi.object<UpdateParkingDto>({
  contact: Joi.string()
    .max(15)
    .pattern(PHONE_REGEX, 'valid phone number')
    .messages({
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
  spots: Joi.number().integer().min(50).max(1500)
}).strict();