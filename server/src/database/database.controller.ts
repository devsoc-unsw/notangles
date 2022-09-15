import { Controller } from '@nestjs/common';
import { DatabaseService } from './database.service';

// @UseInterceptors(SessionSerializer) // I think? (uncomment me when i work)
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}
}
