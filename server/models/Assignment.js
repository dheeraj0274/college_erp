import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: { type: Date, default: Date.now },
    marks: { type: Number },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
