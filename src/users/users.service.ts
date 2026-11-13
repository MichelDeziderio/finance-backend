import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: { name: string; email: string; password: string }): Promise<UserDocument> {
    const user = new this.userModel({
      id: uuidv4(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true },
    );
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
