import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = this.authService.generateToken(user);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}