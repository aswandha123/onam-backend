import mongoose from 'mongoose';

const WinnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
    },
    prize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'notified', 'claimed', 'forfeited'],
      default: 'pending',
    },
    wonAt: {
      type: Date,
      default: Date.now,
    },
    claimedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Winner', WinnerSchema);
