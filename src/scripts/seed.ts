import AppDataSource from '../config/data-source';
import { User } from '../entities/user.entity';
import { UserType } from '../entities/checkin.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Initialize the connection
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepo = AppDataSource.getRepository(User);

    const usersData = [
      { username: 'admin', password: 'admin123', userType: UserType.CORPORATE },
      { username: 'providerUser', password: 'provider123', userType: UserType.PROVIDER },
      { username: 'visitorUser', password: 'visitor123', userType: UserType.VISITOR }
    ];

    for (const userData of usersData) {
      const user = userRepo.create({
        username: userData.username,
        password: await bcrypt.hash(userData.password, 10),
        userType: userData.userType
      });

      await userRepo.save(user);
      console.log(`${userData.userType} user created:`, user);
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
