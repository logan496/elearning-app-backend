import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMessage } from '../entities/general-message.entity';
import { DirectMessage } from '../entities/direct-message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(GeneralMessage)
    private generalMessageRepository: Repository<GeneralMessage>,
    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Chat général
  async sendGeneralMessage(senderId: number, content: string) {
    const message = this.generalMessageRepository.create({
      senderId,
      content,
    });
    await this.generalMessageRepository.save(message);
    return this.generalMessageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }

  async getGeneralMessages(limit: number = 50) {
    return this.generalMessageRepository.find({
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Messages directs
  async sendDirectMessage(
    senderId: number,
    recipientId: number,
    content: string,
  ) {
    const message = this.directMessageRepository.create({
      senderId,
      recipientId,
      content,
    });
    await this.directMessageRepository.save(message);
    return this.directMessageRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'recipient'],
    });
  }

  async getConversation(userId: number, otherUserId: number) {
    return this.directMessageRepository.find({
      where: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
      relations: ['sender', 'recipient'],
      order: { createdAt: 'ASC' },
    });
  }

  async getConversations(userId: number) {
    const messages = await this.directMessageRepository
      .createQueryBuilder('msg')
      .where('msg.senderId = :userId OR msg.recipientId = :userId', { userId })
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.recipient', 'recipient')
      .orderBy('msg.createdAt', 'DESC')
      .getMany();

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUserId =
        msg.senderId === userId ? msg.recipientId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: msg.senderId === userId ? msg.recipient : msg.sender,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
      }
    });

    return Array.from(conversationMap.values());
  }

  async markAsRead(messageId: number) {
    await this.directMessageRepository.update(messageId, { isRead: true });
  }
}
