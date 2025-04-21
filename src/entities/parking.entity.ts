import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


export enum ParkingType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  COURTESY = 'courtesy'
}

@Entity()
export class Parking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  contact!: string;

  @Column()
  spots!: number;

  @Column({
    type: 'enum',
    enum: ParkingType,
    default: ParkingType.PUBLIC
  })
  parkingType!: ParkingType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}