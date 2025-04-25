import request from 'supertest';
import app from '../../src/app';
import { createUser, createParking, resetDate, mockDate, initializeTestDB } from '../utils';
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
    await initializeTestDB();

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
    resetDate();
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
      expect(response.body.status).toBe('success');
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
      expect(response.body.status).toBe('error');
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
      expect(response.body.message).toBe('Only corporate users can enter private parkings');
    });

    it('❌ Should NOT allow VISITOR user to check-in in courtesy parking on weekdays', async () => {
      mockDate('2025-04-22T10:00:00'); // Tuesday

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.VISITOR,
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
      expect(response.body.message).toBe('Courtesy parkings are only available on weekends');

      resetDate();
    });

    it('✅ Should allow VISITOR user to check-in in courtesy parking on weekends', async () => {
      mockDate('2025-04-20T10:00:00'); // Sunday

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.VISITOR,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Access granted');

      resetDate();
    });

    it('❌ Should NOT allow VISITOR user to check-in in a parking not found', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${VisitorToken}`)
        .send({
          parkingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          userType: UserType.CORPORATE,
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Parking not found');
    });
  });
});
