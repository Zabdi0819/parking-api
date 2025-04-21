import Joi from 'joi';
import { ParkingType } from '../entities/parking.entity';

// Patrón regex mejorado para teléfonos internacionales
const PHONE_REGEX = /^\+?[0-9][0-9\s\-]{3,20}$/;

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
      'string.pattern.base': 'Phone number must contain only numbers, spaces, hyphens and optional + prefix',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
  spots: Joi.number().integer().min(50).max(1500).required(),
  parkingType: Joi.string().valid('public', 'private', 'courtesy').required()
});

export interface UpdateParkingDto {
  contact?: string;
  spots?: number;
}

export const updateParkingSchema = Joi.object<UpdateParkingDto>({
  contact: Joi.string()
    .max(15)
    .pattern(PHONE_REGEX, 'valid phone number')
    .messages({
      'string.pattern.base': 'Phone number must contain only numbers, spaces, hyphens and optional + prefix',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
  spots: Joi.number().integer().min(50).max(1500)
});