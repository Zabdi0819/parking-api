import AppDataSource  from '../config/data-source';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Initialize the connection
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepo = AppDataSource.getRepository(User);

    // Create admin user
    const admin = userRepo.create({
      username: 'admin',
      password: await bcrypt.hash('admin123', 10)
    });
    await userRepo.save(admin);
    console.log('Admin user created:', admin);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    // Close connection
    await AppDataSource.destroy();
  }
}

seed();