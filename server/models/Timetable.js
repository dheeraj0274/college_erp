import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  slots: [{
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: String },
    type: { type: String, enum: ['lecture', 'lab', 'tutorial', 'break'], default: 'lecture' },
  }],
}, { timestamps: true });

timetableSchema.index({ department: 1, semester: 1, day: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);
