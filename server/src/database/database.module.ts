import { Module } from '@nestjs/common';
import { SessionSerializer } from 'src/auth/session.serializer';

@Module({
  imports: [],
  controllers: [],
  providers: [SessionSerializer],
})
export class DatabaseModule {}
