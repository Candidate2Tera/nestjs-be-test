import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';
import { ApiOkResponsePaginated } from 'src/decorators/api-ok-response-paginated.decorator';
import { ParseMongoObjectIdPipe } from 'src/pipes/parse-mongo-object-id.pipe';
import { CsvParser } from 'src/providers/csv-parser.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadUsersResponseDto } from './dto/upload-users-response.dto';
import { UsersInterceptor } from './interceptors/users.interceptor';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';

@ApiTags('Users API')
@Controller('users')
@UseInterceptors(UsersInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  @ApiOperation({ summary: `Create a new user` })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: User })
  async postUsers(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.create(body);
  }

  @Get('/')
  @ApiOperation({ summary: `Return a list of users` })
  @ApiOkResponsePaginated(User)
  async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedResponseDto<User>> {
    const data = await this.usersService.find(query);
    return new PaginatedResponseDto({
      data,
      limit: query.limit,
      page: query.page,
      sort: query.sort,
      sortBy: query.sortBy,
    });
  }

  @Patch('/:id')
  @ApiOperation({ summary: `Update a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async patchUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: `Soft delete a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async deleteUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
  ): Promise<User> {
    return this.usersService.delete(id);
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // Allow only CSV mimetypes
      fileFilter: (req, file, callback) => {
        if (!file.mimetype?.match(/text\/csv/i)) {
          return callback(null, false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadUsers(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadUsersResponseDto> {
    if (!file) {
      throw new UnprocessableEntityException(
        'Uploaded file is not a CSV file.',
      );
    }

    const users = await CsvParser.parse(file.path);

    const results = await this.usersService.upload(users);

    return new UploadUsersResponseDto(results);
  }
}
