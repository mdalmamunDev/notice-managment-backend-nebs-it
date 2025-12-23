import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import { Types } from 'mongoose';
import paginate from '../../helpers/paginationHelper';
import Notice from './notice.model';
import INotice, { NoticeStatus } from './notice.interface';

class Controller {
  // create notice (admin only)
  create = catchAsync(async (req: Request, res: Response) => {
    const adminId = req.user?.userId;
    const {
      title, body, target, employeeId, employeeName, employeePosition,
      type, publishDate, attachments, status
    } = req.body;

    // ff target is individual, validate required fields
    if (target === 'individual') {
      if (!employeeId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee ID is required for individual target');
      if (!employeeName) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee name is required for individual target');
      if (!employeePosition) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee position is required for individual target');

    }

    const noticeData: Partial<INotice> = {
      createdBy: new Types.ObjectId(adminId),
      title,
      body,
      target,
      type,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      attachments,
      status: status || 'draft'
    };

    // Only add individual fields if target is individual
    if (target === 'individual') {
      noticeData.employeeId = employeeId;
      noticeData.employeeName = employeeName;
      noticeData.employeePosition = employeePosition;
    }


    const result = await Notice.create(noticeData);
    if (!result) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create notice');

    sendResponse(res, { code: StatusCodes.CREATED, message: 'Notice created successfully', data: result });
  });

  // Get all notices with filters
  getAll = catchAsync(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sortField = 'publishDate',
      sortOrder = 'desc',
      target,
      type,
      status,
      keyword
    } = req.query;

    let filters: any = {};

    // search functionality
    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { body: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (target) filters.target = target;
    if (type) filters.type = type;
    if (status) filters.status = status;


    const { results, pagination } = await paginate({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filters,
      sortField: sortField as string,
      sortOrder: sortOrder as string,
      model: Notice,
      populate: [
        { path: 'creator', select: 'name email profileImage' }
      ]
    });

    sendResponse(res, { code: StatusCodes.OK, data: results, pagination });
  });

  getSingle = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;


    const notice = await Notice.findById(id)
      .populate('creator', 'name email profileImage')
      .lean();

    if (!notice) throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');

    // for regular users, check notice status and publish date
    if (userRole !== 'admin') {
      if (notice.status !== 'published') throw new ApiError(StatusCodes.FORBIDDEN, 'Notice not accessible');
      if (notice.publishDate > new Date()) throw new ApiError(StatusCodes.FORBIDDEN, 'Notice not yet published');
      // check is individual target and employeeId matches
      if (notice.target === 'individual' && notice.employeeId !== userId) throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this notice');

    }

    sendResponse(res, { code: StatusCodes.OK, data: notice });
  });

  // update notice (admin only)
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');

    // handle target change
    if (req.body.target && req.body.target !== 'individual') {
      req.body.employeeId = undefined;
      req.body.employeeName = undefined;
      req.body.employeePosition = undefined;
    }

    // if target is individual
    if ((req.body.target === 'individual' || notice.target === 'individual') && req.body.target !== undefined) {
      if (!req.body.employeeId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee ID is required for individual target');
      if (!req.body.employeeName) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee name is required for individual target');
      if (!req.body.employeePosition) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee position is required for individual target');

    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('creator', 'name email profileImage')
      .lean();

    sendResponse(res, { code: StatusCodes.OK, message: 'Notice updated successfully', data: updatedNotice });
  });

  // Update notice status (Admin only)
  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!NoticeStatus.includes(status))
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid status. Valid statuses: ${NoticeStatus.join(', ')}`);


    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('creator', 'name email profileImage')
      .lean();

    if (!updatedNotice) throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');


    sendResponse(res, { code: StatusCodes.OK, message: `Notice status updated to ${status}`, data: updatedNotice });
  });

  // delete notice (admin only)
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const notice = await Notice.findByIdAndDelete(id)
      .populate('creator', 'name email profileImage')
      .lean();

    if (!notice) throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');

    sendResponse(res, { code: StatusCodes.OK, message: 'Notice deleted successfully', data: notice });
  });

  // Get my notices (for employees)
  getMyNotices = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const {
      page = 1,
      limit = 10,
      type,
    } = req.query;


    // filters functionality
    let filters: any = {
      status: 'published',
      publishDate: { $lte: new Date() },
      $or: [
        { target: 'all' },
        { target: 'individual', employeeId: userId }
      ]
    };

    if (type) filters.type = type;

    const { results, pagination } = await paginate({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filters,
      sortField: 'publishDate',
      sortOrder: 'desc',
      model: Notice,
      populate: [
        { path: 'creator', select: 'name email profileImage' }
      ]
    });

    sendResponse(res, { code: StatusCodes.OK, data: results, pagination });
  });
}

const NoticeController = new Controller();
export default NoticeController;