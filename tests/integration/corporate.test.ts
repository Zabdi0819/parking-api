import request from 'supertest';
import app from '../../src/app';
import { createUser, createParking, resetDate, mockDate, initializeTestDB } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { ParkingType } from '../../src/entities/parking.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';

describe('Integration test for Corporate user', () => {
  let corporateToken: string;
  let privateParkingId: string;
  let publicParkingId: string;
  let courtesyParkingId: string;

  beforeAll(async () => {
    await initializeTestDB();

    // Create user
    const userName = `corporateUser-${Date.now()}`;
    const { token } = await createUser(userName, 'corporate123', UserType.CORPORATE);
    corporateToken = token;

    if (!corporateToken) {
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
    it('✅ Should allow CORPORATE user to check-in in public parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: publicParkingId,
          userType: UserType.CORPORATE,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Access granted');
    });

    it('✅ Should allow CORPORATE user to check-in in private parking on weekdays', async () => {
      mockDate('2025-04-22T10:00:00'); // Tuesday
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({ 
          parkingId: privateParkingId,
          userType: UserType.CORPORATE,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Access granted');
    
      resetDate();
    });
    

    it('❌ Should NOT allow CORPORATE user to check-in in private parking on weekends', async () => {
      mockDate('2025-04-20T10:00:00'); // Sunday

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: privateParkingId,
          userType: UserType.CORPORATE,
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
      expect(response.body.message).toBe('Private parkings are only available on weekdays');

      resetDate();
    });

    it('❌ Should NOT allow CORPORATE user to check-in in courtesy parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.CORPORATE,
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
      expect(response.body.message).toBe('Only visitors can enter courtesy parkings');
    });

    it('❌ Should NOT allow CORPORATE user to check-in in a parking not found', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          userType: UserType.CORPORATE,
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Parking not found');
    });
  });
});
