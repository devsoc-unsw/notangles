import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  sendeeId: string;
}

@Schema()
export class FriendRequest {
  @Prop({ unique: true, required: true })
  userId: string;

  @Prop()
  sentRequestsTo: string[];
}

export type FriendRequestDocument = FriendRequest & Document;
export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
