import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const { password, ...result } = user;
    return result;
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users.map(({ password, ...user }) => user);
  }

  async updateUser(id: number, updates: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    Object.assign(user, updates);
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async makePublisher(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    user.isPublisher = true;
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.userRepository.delete(id);
    return { message: 'Utilisateur supprimé' };
  }
}