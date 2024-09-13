import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reviewId: { type: String, required: true },
  vote: { type: String, enum: ['like', 'dislike'], required: true },
});

VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });
export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);