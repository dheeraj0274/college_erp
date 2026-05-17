import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNo: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String },
  batch: { type: String },
  admissionYear: { type: Number },
  fatherName: { type: String },
  motherName: { type: String },
  dob: { type: Date },
  address: { type: String },
  bloodGroup: { type: String },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
