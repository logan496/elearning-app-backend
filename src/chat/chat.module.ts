import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GeneralMessage } from '../entities/general-message.entity';
import { DirectMessage } from '../entities/direct-message.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralMessage, DirectMessage, User])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
