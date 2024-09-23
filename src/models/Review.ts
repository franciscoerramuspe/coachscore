import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewId: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true },
  coachId: { type: String, required: true },
  sportKnowledgeRating: { type: Number, required: true, min: 1, max: 5 },
  managementSkillsRating: { type: Number, required: true, min: 1, max: 5 },
  likabilityRating: { type: Number, required: true, min: 1, max: 5 },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reviewerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
