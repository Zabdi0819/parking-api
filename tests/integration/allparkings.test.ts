import request from 'supertest';
import { initializeTestDB, createUser, createParking, resetDate } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { ParkingType } from '../../src/entities/parking.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';
import app from '../../src/app';

describe('Get Parkings', () => {
  let usertoken: string;

  beforeAll(async () => {
    await initializeTestDB();

     // Create user
        const userName = `getParkingsUser-${Date.now()}`;
        const { token } = await createUser(userName, 'getParkings', UserType.CORPORATE);
        usertoken = token;
    
        if (!usertoken) {
          throw new AppError('Failed to obtain authentication token', 400);
        }
    
        // Create parkings
        const privateParking = await createParking(`Private-${Date.now()}`, '123456789', 100, ParkingType.PRIVATE);
        const publicParking = await createParking(`Public-${Date.now()}`, '987654321', 150, ParkingType.PUBLIC);
        const courtesyParking = await createParking(`Courtesy -${Date.now()}`, '123321123', 300, ParkingType.COURTESY);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    resetDate();
  });

  describe('GET /parkings', () => {
    it('✅ should return a paginated list of parkings', async () => {
      const response = await request(app)
        .get('/parkings')
        .set('Authorization', `Bearer ${usertoken}`)
        .query({ skip: 2, limit: 10, order: 'DESC', orderBy: 'name' });

        console.log("Result: ", response.body.data);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('totalItems');
        expect(Array.isArray(response.body.data.data)).toBe(true);
        expect(typeof response.body.data.totalItems).toBe('number');
    });
  });
});
