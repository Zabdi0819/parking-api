import request from 'supertest';
import app from '../../src/app';
import { createUser, resetDate, initializeTestDB } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { ParkingType } from '../../src/entities/parking.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';

describe('Integration test for parkings creation', () => {
  let providerToken: string;
  let parkingName: string;

  beforeAll(async () => {
    await initializeTestDB();

    parkingName = `Parking-${Date.now()}`;

    // Create user
    const userName = `parkingUser-${Date.now()}`;
    const { token } = await createUser(userName, 'parking123', UserType.CORPORATE);
    providerToken = token;

    if (!providerToken) {
        throw new AppError('Failed to obtain authentication token', 400);
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    resetDate();
  });

  describe('POST /check-in', () => {
    it('✅ Should allow the creation of a new parking', async () => {
      const response = await request(app)
          .post('/parkings')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
              name: parkingName,
              spots: 150,
              contact: '3331234567',
              parkingType: ParkingType.PUBLIC,
          });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(parkingName);
      expect(response.body.data.spots).toBe(150);
      expect(response.body.data.parkingType).toBe(ParkingType.PUBLIC);
    });

    it('❌ Should NOT allow the creation of a parking with a repeat name', async () => {
      const response = await request(app)
          .post('/parkings')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
              name: parkingName,
              spots: 200,
              contact: '3331234567',
              parkingType: ParkingType.PUBLIC,
          });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Parking name already exists',
      });
    });

    it('❌ Should NOT allow the creation of a parking with less than 50 spots.', async () => {
      const response = await request(app)
          .post('/parkings')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
              name: `${parkingName}20`,
              spots: 20,
              contact: '3331234567',
              parkingType: ParkingType.PUBLIC,
          });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('"spots" must be greater than or equal to 50');
    });

    it('❌ Should NOT allow the creation of a parking with more than 1500 spots.', async () => {
      const response = await request(app)
          .post('/parkings')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
              name: `${parkingName}2000`,
              spots: 2000,
              contact: '3331234567',
              parkingType: ParkingType.PUBLIC,
          });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('"spots" must be less than or equal to 1500');
    });

    it('❌ Should NOT allow the creation of a parking with a non-existent type', async () => {
      const response = await request(app)
          .post('/parkings')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
              name: `${parkingName}2000`,
              spots: 300,
              contact: '3331234567',
              parkingType: 'newType',
          });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('"parkingType" must be one of [public, private, courtesy]');
    });
  });
});
