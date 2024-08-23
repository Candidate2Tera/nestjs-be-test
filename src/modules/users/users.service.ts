import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isDateString, isEmail, isPhoneNumber } from 'class-validator';
import { IAppConfig } from 'config/app.config';
import { IMongoConfig } from 'config/mongo.config';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';

type csvUser = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  status: string;
  provider: string;
  birth_date: Date;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService<
      IAppConfig & IMongoConfig,
      true
    >,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  getModel(): Model<User> {
    return this.userModel;
  }

  async find(query: QueryUserDto): Promise<User[]> {
    const { limit, page, sortBy, sort, ...userFilter } = query;
    userFilter.isDeleted = false;
    return this.userModel
      .find(userFilter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sort });
  }

  async create(body: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(body);
    return newUser.save();
  }

  async update(id: Types.ObjectId, body: UpdateUserDto): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { _id: id.toString(), isDeleted: false },
      body,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async delete(id: Types.ObjectId) {
    return this.userModel.findOneAndUpdate(
      { _id: id.toString(), isDeleted: false },
      { isDeleted: true },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async upload(csvUsers: csvUser[]) {
    let failedCount = 0;
    let successCount = 0;
    for (let i = 0; i < csvUsers.length; i++) {
      const user = csvUsers[i];
      if (
        !user.firstname ||
        !user.lastname ||
        !user.email ||
        !user.phone ||
        !user.status ||
        !user.provider ||
        !user.birth_date
      ) {
        failedCount++;
        continue;
      }
      if (!isEmail(user.email)) {
        failedCount++;
        continue;
      }
      if (!isPhoneNumber(user.phone, 'US')) {
        failedCount++;
        continue;
      }
      if (!isDateString(user.birth_date)) {
        failedCount++;
        continue;
      }
      const newUser = new this.userModel({
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
        status: user.status,
        marketingSource: user.provider,
        birthDate: new Date(user.birth_date),
      });
      try {
        await newUser.save();
        successCount++;
      } catch (err) {
        failedCount++;
      }
    }
    return {
      failedCount,
      successCount,
    };
  }
}
