import mongoose, { Schema } from 'mongoose';
import INotice, { NoticeTarget, NoticeType, NoticeStatus } from './notice.interface';

const noticeSchema = new Schema<INotice>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      validate: {
        validator: async function(value: mongoose.Types.ObjectId) {
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return !!user;
        },
        message: 'Creator not found with given ID'
      }
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
      maxlength: [5000, 'Body cannot be more than 5000 characters']
    },
    target: {
      type: String,
      enum: {
        values: NoticeTarget,
        message: `Target must be one of: ${NoticeTarget.join(', ')}`
      },
      required: [true, 'Target is required']
    },
    employeeId: {
      type: String,
      trim: true
    },
    employeeName: {
      type: String,
      trim: true,
      maxlength: [100, 'Employee name cannot be more than 100 characters']
    },
    employeePosition: {
      type: String,
      trim: true,
      maxlength: [100, 'Employee position cannot be more than 100 characters']
    },
    type: {
      type: String,
      enum: {
        values: NoticeType,
        message: `Type must be one of: ${NoticeType.join(', ')}`
      },
      required: [true, 'Type is required']
    },
    publishDate: {
      type: Date,
      required: [true, 'Publish date is required'],
      default: Date.now
    },
    attachments: {
      type: [String],
      validate: {
        validator: function(value: string[]) {
          return value.length <= 5;
        },
        message: 'Maximum 5 attachments allowed'
      }
    },
    status: {
      type: String,
      enum: {
        values: NoticeStatus,
        message: `Status must be one of: ${NoticeStatus.join(', ')}`
      },
      default: 'draft'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// to get single creator
noticeSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profileImage' }
});

// Indexes
noticeSchema.index({ target: 1 });
noticeSchema.index({ status: 1 });
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ type: 1 });
noticeSchema.index({ createdBy: 1 });
noticeSchema.index({ employeeId: 1 });
noticeSchema.index({ target: 1, status: 1 });

// Pre-save middleware for validation
noticeSchema.pre('save', function(next) {
  // Only validate individual fields if target is 'individual'
  if (this.target === 'individual') {
    if (!this.employeeId) {
      next(new Error('Employee ID is required when target is individual'));
      return;
    }
    if (!this.employeeName) {
      next(new Error('Employee name is required when target is individual'));
      return;
    }
  }
  
  // Trim all string fields
  if (this.title) this.title = this.title.trim();
  if (this.body) this.body = this.body.trim();
  if (this.employeeName) this.employeeName = this.employeeName.trim();
  if (this.employeePosition) this.employeePosition = this.employeePosition.trim();
  if (this.employeeId) this.employeeId = this.employeeId.trim();
  
  next();
});

const Notice = mongoose.model<INotice>('Notice', noticeSchema);
export default Notice;