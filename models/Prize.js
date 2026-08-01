import mongoose from 'mongoose';

const PrizeSchema = new mongoose.Schema(
  {
    rank: {
      type: Number,
      required: [true, 'Prize rank is required'],
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Prize title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    ribbonText: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    perks: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['unclaimed', 'claimed'],
      default: 'unclaimed',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Prize', PrizeSchema);
