import request from 'supertest';
import app from '../../src/server';
import { createUser, createParking } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { ParkingType } from '../../src/entities/parking.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';

describe('Integration test for Visitor user', () => {
  let VisitorToken: string;
  let privateParkingId: string;
  let publicParkingId: string;
  let courtesyParkingId: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create user
    const userName = `VisitorUser-${Date.now()}`;
    const { token } = await createUser(userName, 'Visitor123', UserType.VISITOR);
    VisitorToken = token;

    if (!VisitorToken) {
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
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    jest.useRealTimers();
  });

  describe('POST /check-in', () => {
    it('✅ Should allow VISITOR user to check-in in public parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: publicParkingId,
          userType: UserType.VISITOR,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
    });

    it('❌ Should NOT VISITOR user to check-in in private parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({ 
          parkingId: privateParkingId,
          userType: UserType.VISITOR,
        });
    
      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
    });

    it('❌ Should NOT allow VISITOR user to check-in in courtesy parking on weekdays', async () => {
      const mockDate = new Date('2025-04-08T10:00:00'); // Tuesday
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.VISITOR,
        });

      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');

      jest.spyOn(global.Date, 'now').mockRestore();
    });

    it('✅ Should allow VISITOR user to check-in in courtesy parking on weekends', async () => {
      const mockDate = new Date('2025-04-06T10:00:00'); // Sunday
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.VISITOR,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');

      jest.spyOn(global.Date, 'now').mockRestore();
    });
  });
});
