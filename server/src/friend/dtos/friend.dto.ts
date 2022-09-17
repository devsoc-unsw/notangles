import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class SingleFriendRequestDto {
  userId: string;
  sentRequestTo: string;
}

@Schema()
export class FriendRequest {
  @Prop({ unique: true, required: true })
  userId: string;

  @Prop({ unique: true, required: true })
  sentRequestsTo: string[];
}

export type FriendRequestDocument = FriendRequest & Document;
export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
