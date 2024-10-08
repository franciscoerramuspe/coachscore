import mongoose from 'mongoose';

const SchoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    logo: { type: String, required: true },
    sports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
    coaches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coach' }],
  },
  { timestamps: true }
);

export default mongoose.models.School || mongoose.model('School', SchoolSchema);
