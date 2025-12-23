import { Model, Types } from 'mongoose';
import { Role } from '../../middlewares/roles';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import { TGeoLocation, TUserStatus } from './user.constant';

export type TUser = {
  _id: Types.ObjectId;
  partnerId?: Types.ObjectId;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  location: TGeoLocation | null;
  profileImage: string;
  role: Role;
  password: string;
  status: TUserStatus;
  isEmailVerified: boolean;
  isResetPassword: boolean;
  isDeleted: boolean;
  lastPasswordChange: Date;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  step: number,
  createdAt: Date;
  updatedAt: Date;
};

export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: PaginateOptions
  ) => Promise<PaginateResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
