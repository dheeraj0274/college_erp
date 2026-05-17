import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  examType: { type: String, enum: ['mid-sem', 'end-sem', 'internal', 'assignment'], required: true },
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  grade: { type: String },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

resultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
