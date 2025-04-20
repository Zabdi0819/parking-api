import { DataSource } from 'typeorm';
import { Parking } from '../entities/parking.entity';
import { User } from '../entities/user.entity';
import { CheckIn } from '../entities/checkin.entity';

require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Parking, User, CheckIn],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: false,
  logging: true,
});

export const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized');
  } catch (error) {
    console.error('Error during Data Source initialization', error);
    throw error;
  }
};

export default AppDataSource;