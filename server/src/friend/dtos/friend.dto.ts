import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class SingleFriendRequestDto {
  userId: string;
  friendId: string;
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
