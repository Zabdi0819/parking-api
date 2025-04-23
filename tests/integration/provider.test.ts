import request from 'supertest';
import app from '../../src/server';
import { createUser, createParking } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { ParkingType } from '../../src/entities/parking.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';

describe('Integration test for Provider user', () => {
  let providerToken: string;
  let privateParkingId: string;
  let publicParkingId: string;
  let courtesyParkingId: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create user
    const userName = `providerUser-${Date.now()}`;
    const { token } = await createUser(userName, 'provider123', UserType.PROVIDER);
    providerToken = token;

    if (!providerToken) {
      throw new AppError('Failed to obtain authentication token', 400);
    }

    // Create parkings
    const privateParking = await createParking(`Private-${Date.now()}`, '123456789', 100, ParkingType.PRIVATE);
    const publicParking = await createParking(`Public-${Date.now()}`, '987654321', 150, ParkingType.PUBLIC);
    const courtesyParking = await createParking(`Courtesy -${Date.now()}`, '123321123', 300, ParkingType.COURTESY);

    privateParkingId = privateParking.id;
    publicParkingId = publicParking.id;
    courtesyParkingId = courtesyParking.id;
  });

  afterAll(async () => {
    jest.useRealTimers();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /check-in', () => {
    it('✅ Should allow PROVIDER user to check-in in public parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ 
          parkingId: publicParkingId,
          userType: UserType.PROVIDER,
        });
    
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
    });
    

    it('❌ Should NOT allow PROVIDER user to check-in in private parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          parkingId: privateParkingId,
          userType: UserType.PROVIDER,
        });

      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
    });

    it('❌ Should NOT allow PROVIDER user to check-in in courtesy parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.PROVIDER,
        });

      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
    });
  });
});
