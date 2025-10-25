import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('direct_messages')
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User, user => user.receivedMessages)
  recipient: User;

  @Column()
  recipientId: number;
}