import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import AppDataSource from '../config/data-source';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) return null;

    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '1h' }
    );
  }
}