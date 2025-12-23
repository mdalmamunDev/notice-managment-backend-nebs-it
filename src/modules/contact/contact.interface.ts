import { Types } from 'mongoose';

export interface IContact {
  _id: Types.ObjectId;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}