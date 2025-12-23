import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import mongoose from 'mongoose';
import paginate from '../../helpers/paginationHelper';
import Contact from './contact.model';
import { IContact } from './contact.interface';
import moment from 'moment';

class Controller {
  // Create a new contact message (no auth required - guest access)
  create = catchAsync(async (req: Request, res: Response) => {
    const { name, email, message }: IContact = req.body;

    const result = await Contact.create({ name, email, message });
    if (!result) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send message');
    }

    sendResponse(res, {
      code: StatusCodes.CREATED,
      message: 'Message sent successfully',
      data: result
    });
  });

  // Get all contact messages (with pagination + filters) - Admin only
  getAll = catchAsync(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sortField = 'createdAt',
      sortOrder = 'desc',
      isRead,
      keyword
    } = req.query;

    let filters: any = {};

    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }

    if (keyword) {
      const keywordFilter = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
          { message: { $regex: keyword, $options: 'i' } }
        ]
      };
      filters = { ...filters, ...keywordFilter };
    }

    const { results, pagination } = await paginate({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filters,
      sortField: sortField as string,
      sortOrder: sortOrder as string,
      model: Contact
    });

    const resResult = results.map((user: any) => ({
      ...user.toObject(),
      ago: moment(user.createdAt).fromNow(),
    }));

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Contact messages fetched successfully',
      data: resResult,
      pagination
    });
  });

  // Get single contact message by ID - Admin only
  getSingle = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid contact message ID');
    }

    const contact = await Contact.findById(id).lean();
    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Contact message not found');
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Contact message fetched successfully',
      data: contact
    });
  });

  // Mark as read/unread - Admin only
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid contact message ID');
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Contact message not found');
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Contact message updated successfully',
      data: contact
    });
  });

  // Delete contact message - Admin only
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid contact message ID');
    }

    const contact = await Contact.findByIdAndDelete(id).lean();
    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Contact message not found');
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Contact message deleted successfully',
      data: contact
    });
  });

  // Mark multiple messages as read - Admin only
  markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid message IDs');
    }

    // Validate all IDs
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid contact message ID: ${id}`);
      }
    }

    const result = await Contact.updateMany(
      { _id: { $in: ids } },
      { isRead: true }
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      message: `${result.modifiedCount} messages marked as read successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  });

  // Get contact statistics - Admin only
  getStats = catchAsync(async (req: Request, res: Response) => {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ isRead: false });
    const read = await Contact.countDocuments({ isRead: true });

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Contact statistics fetched successfully',
      data: {
        total,
        unread,
        read
      }
    });
  });
}

const ContactController = new Controller();
export default ContactController;