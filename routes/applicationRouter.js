import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { applicationEmail, applicationSections } from '../utils/applicationDetails.js';
import { sendEmail } from '../utils/notify.js';

export function applicationRouter(Model, type) {
 const router = express.Router();
 router.post('/', async (req, res, next) => {
  try {
   const fields = Object.values(applicationSections[type]).flat();
   const input = Object.fromEntries(fields.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
   if (typeof input.emailAddress !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.emailAddress) || !Number.isFinite(Number(input.desiredCreditAmount)) || Number(input.desiredCreditAmount) <= 0) {
    return res.status(400).json({ success: false, message: 'A valid email address and positive loan amount are required.' });
   }
   const application = await Model.create(input);
   if (process.env.NOTIFY_EMAIL) {
    const email = applicationEmail(application, type);
    try { await sendEmail(process.env.NOTIFY_EMAIL, email.subject, email.text, email.html); }
    catch (error) { console.error('Application saved, but notification failed', error); }
   }
   res.status(201).json({ success: true, message: 'Application submitted successfully!', data: { _id: application._id } });
  } catch (error) { next(error); }
 });
 // Preserve the existing list URL, but protect borrower information.
 router.get('/', requireAdmin, async (req, res, next) => {
  try {
   const page = Math.max(1, parseInt(req.query.page) || 1);
   const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
   const [data, total] = await Promise.all([Model.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), Model.countDocuments()]);
   res.json({ success: true, data, pagination: { current: page, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
 });
 return router;
}
