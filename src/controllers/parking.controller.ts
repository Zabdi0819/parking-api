import { Request, Response } from 'express';
import { ParkingService } from '../services/parking.service';
import { CreateParkingDto, UpdateParkingDto } from '../dtos/parking.dto';
import { createParkingSchema, updateParkingSchema } from '../dtos/parking.dto'; // Importa los schemas de validación

export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  async createParking(req: Request, res: Response) {
    // 1. Validación del DTO
    const { error } = createParkingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        status: 'error',
        message: error.details[0].message 
      });
    }

    const createParkingDto: CreateParkingDto = req.body;
    
    try {
      const parking = await this.parkingService.createParking(createParkingDto);
      res.status(201).json({
        status: 'success',
        data: parking
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          status: 'error',
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          status: 'error',
          message: 'Unknown error occurred' 
        });
      }
    }
  }

  async getAllParkings(req: Request, res: Response) {
    const { skip = '0', limit = '10', order = 'asc', orderBy = 'createdAt' } = req.query;
    
    try {
      const result = await this.parkingService.getAllParkings(
        Number(skip),
        Number(limit),
        order as 'asc' | 'desc',
        orderBy as string
      );
      res.json({
        status: 'success',
        data: result
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          status: 'error',
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          status: 'error',
          message: 'Unknown error occurred' 
        });
      }
    }
  }

  async updateParking(req: Request, res: Response) {
    const { id } = req.params;
    const updateParkingDto: UpdateParkingDto = req.body;
    
    // Añade esta validación
    const { error } = updateParkingSchema.validate(updateParkingDto);
    if (error) {
        return res.status(400).json({ 
            status: "error",
            message: error.details[0].message 
        });
    }

    try {
        const parking = await this.parkingService.updateParking(id, updateParkingDto);
        res.json(parking);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
}
}