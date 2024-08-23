import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export const USERS_COLLECTION = 'users';

@Schema({
  collection: USERS_COLLECTION,
  timestamps: true,
})
export class User {
  @ApiResponseProperty()
  _id: Types.ObjectId;

  @ApiProperty({
    description: `User's birthdate`,
    example: new Date().toISOString(),
    required: false,
  })
  @Prop({ type: Date, required: true })
  birthDate: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({
    description: `User's email address`,
    example: 'johnsmith@nestjs.com',
    required: false,
  })
  @Prop({ required: true })
  email: string;

  @ApiProperty({
    description: `User's first name`,
    example: 'John',
    required: false,
  })
  @Prop({ required: true })
  firstName: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @ApiProperty({
    description: `User's last name`,
    example: 'Smith',
    required: false,
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ required: false })
  @Prop({ required: true })
  marketingSource: string;

  @ApiProperty({ required: false })
  @Prop({ required: true, index: true })
  phone: string;

  @ApiProperty({
    description: `User's status`,
    example: 'DQL',
    required: false,
  })
  @Prop({ required: true })
  status: string;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;

  constructor(args?: Partial<User>) {
    Object.assign(this, args);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
