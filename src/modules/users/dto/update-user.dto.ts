import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    required: false,
  })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({
    required: false,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsString()
  marketingSource: string;

  @ApiProperty({ required: false })
  @IsPhoneNumber('US')
  phone: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  status: string;

  constructor(args?: Partial<UpdateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
