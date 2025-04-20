import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity'
import { Parking } from './parking.entity';


export enum UserType {
  CORPORATE = 'corporate',
  PROVIDER = 'provider',
  VISITOR = 'visitor'
}

@Entity()
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Parking)
  parking!: Parking;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.VISITOR
  })
  userType!: UserType;

  @Column({ default: false })
  accessGranted!: boolean;

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}