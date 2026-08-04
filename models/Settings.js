import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: 'Thiruvonam Mega Staff Lucky Draw',
      trim: true,
    },
    targetAmount: {
      type: Number,
      default: 150000,
    },
    entryFee: {
      type: Number,
      default: 150,
    },
    targetDate: {
      type: Date,
      default: new Date('2026-08-28T17:00:00+05:30'),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Settings', SettingsSchema);
