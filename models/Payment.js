import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
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
    razorpaySignature: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', PaymentSchema);
