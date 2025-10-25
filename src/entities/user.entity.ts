import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Podcast } from './podcast.entity';
import { GeneralMessage } from './general-message.entity';
import { DirectMessage } from './direct-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  })
  avatar: string;

  @Column({ default: false })
  isPublisher: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Podcast, podcast => podcast.publisher)
  podcasts: Podcast[];

  @OneToMany(() => GeneralMessage, msg => msg.sender)
  generalMessages: GeneralMessage[];

  @OneToMany(() => DirectMessage, msg => msg.sender)
  sentMessages: DirectMessage[];

  @OneToMany(() => DirectMessage, msg => msg.recipient)
  receivedMessages: DirectMessage[];
}
