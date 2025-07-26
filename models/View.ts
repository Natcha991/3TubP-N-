import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  viewedAt: { type: Date, default: Date.now },
});

export default mongoose.models.View || mongoose.model('View', viewSchema);