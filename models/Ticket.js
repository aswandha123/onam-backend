import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      required: [true, 'Ticket code is required'],
      unique: true,
      trim: true,
    },
    purchaserName: {
      type: String,
      required: [true, 'Purchaser name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
      default: 150,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    prizeWon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
TicketSchema.index({ phone: 1 });
TicketSchema.index({ paymentStatus: 1 });

export default mongoose.model('Ticket', TicketSchema);
