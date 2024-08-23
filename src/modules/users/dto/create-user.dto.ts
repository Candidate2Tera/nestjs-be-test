import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { User } from '../schema/user.schema';

export class CreateUserDto extends User {
  @ApiProperty({
    required: true,
  })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  lastName: string;

  @ApiProperty({ required: true })
  @IsString()
  marketingSource: string;

  @ApiProperty({ required: true })
  @IsPhoneNumber('US')
  phone: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  status: string;

  constructor(args?: Partial<CreateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
