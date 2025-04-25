import { CheckInService } from '../../src/services/checkin.service';
import { ParkingService } from '../../src/services/parking.service';
import { CheckInRepository } from '../../src/repositories/checkin.repository';
import { ParkingType } from '../../src/entities/parking.entity';
import { UserType } from '../../src/entities/checkin.entity';
import { CheckInFactory } from '../../src/factories/checkin.factory';
import { CreateCheckInDto } from '../../src/dtos/checkin.dto';

jest.mock('../../src/factories/checkin.factory');

describe('CheckInService Unit Test for Corporate User', () => {
  let checkInService: CheckInService;
  const mockParkingService = { getParkingById: jest.fn() };
  const mockCheckInRepository = { save: jest.fn() };

  const userId = 'user-123';
  const baseDto = {
    userId,
    userType: UserType.CORPORATE,
  };

  beforeEach(() => {
    checkInService = new CheckInService(
      mockParkingService as unknown as ParkingService,
      mockCheckInRepository as unknown as CheckInRepository
    );
    jest.clearAllMocks();
  });

  it('✅ Should allow CORPORATE user to check-in in public parking', async () => {
    const parking = { id: 'public-id', parkingType: ParkingType.PUBLIC };
    const dto: CreateCheckInDto = { ...baseDto, parkingId: parking.id };

    const validatorMock = {
      canUserEnter: jest.fn().mockReturnValue({ canEnter: true })
    };

    (CheckInFactory.createParking as jest.Mock).mockReturnValue(validatorMock);
    mockParkingService.getParkingById.mockResolvedValue(parking);
    mockCheckInRepository.save.mockResolvedValue({
      parking: parking,
      user: { id: userId },
      userType: baseDto.userType,
      accessGranted: true,
      reason: ''
    });

    const result = await checkInService.handleCheckIn(dto);

    expect(result.accessGranted).toBe(true);
    expect(mockCheckInRepository.save).toHaveBeenCalled();
  });

  it('✅ Should allow CORPORATE user to check-in in private parking on weekdays', async () => {
    const parking = { id: 'private-id', parkingType: ParkingType.PRIVATE };
    const dto: CreateCheckInDto = { ...baseDto, parkingId: parking.id };

    const validatorMock = {
      canUserEnter: jest.fn().mockReturnValue({ canEnter: true })
    };

    (CheckInFactory.createParking as jest.Mock).mockReturnValue(validatorMock);
    mockParkingService.getParkingById.mockResolvedValue(parking);
    mockCheckInRepository.save.mockResolvedValue({
      parking: parking,
      user: { id: userId },
      userType: baseDto.userType,
      accessGranted: true,
      reason: ''
    });

    const result = await checkInService.handleCheckIn(dto);

    expect(result.accessGranted).toBe(true);
    expect(mockCheckInRepository.save).toHaveBeenCalled(); // Ensure check-in is saved
  });

  it('❌ Should NOT allow CORPORATE user to check-in in private parking on weekends', async () => {
    const parking = { id: 'private-id', parkingType: ParkingType.PRIVATE };
    const dto: CreateCheckInDto = { ...baseDto, parkingId: parking.id };
  
    const validatorMock = {
      canUserEnter: jest.fn().mockReturnValue({
        canEnter: false,
        message: 'Private parkings are only available on weekends'
      })
    };
  
    (CheckInFactory.createParking as jest.Mock).mockReturnValue(validatorMock);
    mockParkingService.getParkingById.mockResolvedValue(parking);
    mockCheckInRepository.save.mockResolvedValue({
      parking: parking,
      user: { id: userId },
      userType: baseDto.userType,
      accessGranted: false,
      reason: 'Private parkings are only available on weekends'
    });
  
    const result = await checkInService.handleCheckIn(dto);
  
    expect(result.accessGranted).toBe(false);
    expect(result.reason).toBe('Private parkings are only available on weekends');
    expect(mockCheckInRepository.save).toHaveBeenCalled();
  });
  
  it('❌ Should NOT allow CORPORATE user to check-in in courtesy parking', async () => {
    const parking = { id: 'courtesy-id', parkingType: ParkingType.COURTESY };
    const dto: CreateCheckInDto = { ...baseDto, parkingId: parking.id };
  
    const validatorMock = {
      canUserEnter: jest.fn().mockReturnValue({
        canEnter: false,
        message: 'Only visitors can enter courtesy parkings'
      })
    };
  
    (CheckInFactory.createParking as jest.Mock).mockReturnValue(validatorMock);
    mockParkingService.getParkingById.mockResolvedValue(parking);
    mockCheckInRepository.save.mockResolvedValue({
      parking: parking,
      user: { id: userId },
      userType: baseDto.userType,
      accessGranted: false,
      reason: 'Only visitors can enter courtesy parkings'
    });
  
    const result = await checkInService.handleCheckIn(dto);
  
    expect(result.accessGranted).toBe(false);
    expect(result.reason).toBe('Only visitors can enter courtesy parkings');
    expect(mockCheckInRepository.save).toHaveBeenCalled();
  });  

  it('❌ Should throw error if parking is not found', async () => {
    const dto: CreateCheckInDto = { ...baseDto, parkingId: 'not-found-id' };

    mockParkingService.getParkingById.mockResolvedValue(null);

    await expect(checkInService.handleCheckIn(dto)).rejects.toThrow('Parking not found');
  });
});
