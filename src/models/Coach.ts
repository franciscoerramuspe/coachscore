import mongoose from 'mongoose';

const CoachSchema = new mongoose.Schema({
  coachId: { type: String, required: true, unique: true },
  coachFirstName: { type: String, required: true },
  coachLastName: { type: String, required: true },
  schoolId: { type: String, required: true },
  sportId: { type: String, required: true },
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Coach || mongoose.model('Coach', CoachSchema);
