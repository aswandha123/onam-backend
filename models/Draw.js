import mongoose from 'mongoose';

const DrawSchema = new mongoose.Schema(
  {
    drawName: {
      type: String,
      required: [true, 'Draw name is required'],
      trim: true,
    },
    prize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      required: [true, 'Associated prize is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    winnerTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    drawnAt: {
      type: Date,
    },
    drawnBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Draw', DrawSchema);
