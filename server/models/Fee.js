import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  status: { type: String, enum: ['paid', 'partial', 'unpaid', 'overdue'], default: 'unpaid' },
  payments: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['cash', 'online', 'cheque', 'dd'] },
    transactionId: String,
    receiptNo: String,
  }],
  scholarship: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
