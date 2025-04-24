import request from 'supertest';
import app from '../../src/app';
import { createUser, initializeTestDB, resetDate } from '../utils';
import { UserType } from '../../src/entities/checkin.entity';
import { AppError } from '../../src/utils/error';
import AppDataSource from '../../src/config/data-source';

describe('Integration test for user authentication', () => {
    let userName: string;
    let passworsUser: string;

  beforeAll(async () => {
    await initializeTestDB();

    // Create user
    userName = `User-${Date.now()}`;
    passworsUser = 'user123'
    const { user } = await createUser(userName, passworsUser, UserType.CORPORATE);

    if (!user) {
        throw new AppError('Failed to obtain user data', 400);
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    resetDate();
  });

  describe('POST /auth/login', () => {
    it('✅ Should allow USER authentication', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: userName,
          password: passworsUser,
        });
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('❌ Should NOT allow USER authentication', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
            username: 'UserTest',
            password: passworsUser,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });
});
