import { Injectable, SerializeOptions } from '@nestjs/common';
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Injectable()
export class DatabaseService {}
