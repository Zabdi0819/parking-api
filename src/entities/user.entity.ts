import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CheckIn } from './checkin.entity';
import * as bcrypt from 'bcryptjs';

export enum UserType {
  CORPORATE = 'corporate',
  PROVIDER = 'provider',
  VISITOR = 'visitor'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

   @Column({
      type: 'enum',
      enum: UserType,
      default: UserType.VISITOR
    })
  userType!: UserType;

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  @OneToMany(() => CheckIn, checkIn => checkIn.user)
  checkIns!: CheckIn[]
}