import { ParkingType } from '../entities/parking.entity';

export interface ParkingValidation {
  canUserEnter(userType: string): { canEnter: boolean; message?: string };
}

export class PublicParking implements ParkingValidation {
  canUserEnter(userType: string) {
    return { canEnter: true };
  }
}

export class PrivateParking implements ParkingValidation {
  canUserEnter(userType: string) {
    const day = new Date().getDay(); // 0 (Domingo) a 6 (Sábado)
    const isWeekday = day >= 1 && day <= 5;
    
    if (userType !== 'corporate') {
      return { canEnter: false, message: 'Only corporate users can enter private parkings' };
    }
    
    if (!isWeekday) {
      return { canEnter: false, message: 'Private parkings are only available on weekdays' };
    }
    
    return { canEnter: true };
  }
}

export class CourtesyParking implements ParkingValidation {
  canUserEnter(userType: string) {
    const day = new Date().getDay(); // 0 (Domingo) a 6 (Sábado)
    const isWeekend = day === 0 || day === 6;
    
    if (userType !== 'visitor') {
      return { canEnter: false, message: 'Only visitors can enter courtesy parkings' };
    }
    
    if (!isWeekend) {
      return { canEnter: false, message: 'Courtesy parkings are only available on weekends' };
    }
    
    return { canEnter: true };
  }
}

export class ParkingFactory {
  static createParking(parkingType: ParkingType): ParkingValidation {
    switch (parkingType) {
      case ParkingType.PRIVATE:
        return new PrivateParking();
      case ParkingType.COURTESY:
        return new CourtesyParking();
      case ParkingType.PUBLIC:
      default:
        return new PublicParking();
    }
  }
}