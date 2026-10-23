export const reviewFields = {
 status: { type: String, enum: ['pending', 'clarification_requested', 'documents_requested', 'approved', 'rejected'], default: 'pending' },
 responseLockUntil: { type: Date, select: false },
 responses: [{
  kind: { type: String, enum: ['clarification', 'documents', 'approved', 'rejected'] },
  subject: String,
  message: String,
  recipient: String,
  sentAt: Date,
  delivery: { type: String, enum: ['sending', 'sent', 'failed'], default: 'sending' },
  createdAt: { type: Date, default: Date.now },
 }],
};
