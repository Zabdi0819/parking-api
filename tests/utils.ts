// test/utils.ts
import AppDataSource from '../src/config/data-source';
import { User } from '../src/entities/user.entity';
import { UserType } from '../src/entities/checkin.entity';
import { ParkingType } from '../src/entities/parking.entity';
import * as bcrypt from 'bcryptjs';
import { ParkingService } from '../src/services/parking.service';
import { ParkingRepository } from '../src/repositories/parking.repository';
import request from 'supertest';
import app from '../src/server';

export async function initializeTestDB() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true); // Borra y crea de nuevo
}

export async function createUser(
  username: string,
  password: string,
  userType: UserType
) {
  const userRepo = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepo.create({
    username: username,
    password: hashedPassword,
    userType: userType,
  });
  await userRepo.save(user);

  // Autenticamos al usuario para obtener el token
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ username: username, password: password });

  return {
    user,
    token: loginRes.body.token,
  };
}

export async function createParking(name: string, contact: string, spots: number, type: ParkingType) {
    const parkingRepo = new ParkingRepository();
    const parkingService = new ParkingService(parkingRepo);
    const parking = await parkingService.createParking({
        name,
        contact: contact,
        spots: spots,
        parkingType: type,
    });

    return parking;
}

export function mockDate(dateStr: string) {
  jest.useFakeTimers().setSystemTime(new Date(dateStr));
}

export function resetDate() {
  jest.useRealTimers();
}
