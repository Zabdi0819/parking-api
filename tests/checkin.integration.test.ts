import request from 'supertest';
import app from '../src/app';
import { Parking } from '../src/entities/parking.entity';
import { DataSource } from 'typeorm';

describe('CheckIn Controller', () => {
  let connection: DataSource;
  let testParking: Parking;

  beforeAll(async () => {
    connection = await initializeDB();
    
    // Crear un estacionamiento de prueba
    const parkingRepo = connection.getRepository(Parking);
    testParking = await parkingRepo.save({
      name: 'Test Parking',
      contact: '+123456789',
      spots: 100,
      parkingType: 'private',
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should allow corporate user on weekday', async () => {
    // Mock Date to be a weekday
    jest.spyOn(global.Date, 'now').mockImplementation(() => 
      new Date('2023-05-15T10:00:00Z').valueOf()
    );
    
    const res = await request(app)
      .post('/check-in')
      .send({
        parkingId: testParking.id,
        userType: 'corporate',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should deny visitor on private parking', async () => {
    const res = await request(app)
      .post('/check-in')
      .send({
        parkingId: testParking.id,
        userType: 'visitor',
      });
    
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('ACCESS_DENIED');
  });
});