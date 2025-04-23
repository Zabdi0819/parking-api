import request from 'supertest';
import app from '../../src/server';
import { createUser, createParking } from '../utils';
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
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

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
    jest.useRealTimers();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /check-in', () => {
    it('✅ Should allow CORPORATE user to check-in in private parking on weekdays', async () => {
      const mockDate = new Date('2025-04-08T10:00:00'); // Tuesday
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());
    
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({ 
          parkingId: privateParkingId,
          userType: UserType.CORPORATE,
        });
      
      console.log(response.body);
    
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
    
      jest.spyOn(global.Date, 'now').mockRestore();
    });
    

    it('❌ Should NOT allow CORPORATE user to check-in in private parking on weekends', async () => {
      const mockDate = new Date('2025-04-06T10:00:00'); // Sunday
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: privateParkingId,
          userType: UserType.CORPORATE,
        });

      console.log(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');

      jest.spyOn(global.Date, 'now').mockRestore();
    });

    it('✅ Should allow CORPORATE user to check-in in public parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: publicParkingId,
          userType: UserType.CORPORATE,
        });
      
      console.log(response.body);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
    });

    it('❌ Should NOT allow CORPORATE user to check-in in courtesy parking', async () => {
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${corporateToken}`)
        .send({
          parkingId: courtesyParkingId,
          userType: UserType.CORPORATE,
        });

      console.log(response.body);
      
      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('ACCESS_DENIED');
    });
  });
});
