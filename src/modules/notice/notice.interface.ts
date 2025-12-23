import { Types } from 'mongoose';


export type INoticeTarget = 'all' | 'finance' | 'sales' | 'web' | 'database' | 'admin' | 'individual' | 'hr';
export const NoticeTarget: INoticeTarget[] = ['all', 'finance', 'sales', 'web', 'database', 'admin', 'individual', 'hr'];

export type INoticeType = 'warning' | 'disciplinary' | 'performance_improvement' | 'appreciation' | 'recognition' | 'attendance' | 'leave_issue' | 'payroll' | 'compensation' | 'contract_update' | 'role_update' | 'advisory' | 'personal_reminder';
export const NoticeType: INoticeType[] = ['warning', 'disciplinary', 'performance_improvement', 'appreciation', 'recognition', 'attendance', 'leave_issue', 'payroll', 'compensation', 'contract_update', 'role_update', 'advisory', 'personal_reminder'];

export type INoticeStatus = 'published' | 'unpublished' | 'draft';
export const NoticeStatus: INoticeStatus[] = ['published', 'unpublished', 'draft'];

interface INotice {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId; // admin id
  title: string;
  body: string;
  target: INoticeTarget;
  employeeId?: string; // if target = individual
  employeeName?: string; // if target = individual
  employeePosition?: string; // if target = individual
  type: INoticeType;
  publishDate: Date;
  attachments?: string[];
  status: INoticeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export default INotice;