import mongoose from 'mongoose';

const SportSchema = new mongoose.Schema({
  sportId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Sport || mongoose.model('Sport', SportSchema);
