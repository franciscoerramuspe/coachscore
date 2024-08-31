import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewId: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true },
  coachId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reviewerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
