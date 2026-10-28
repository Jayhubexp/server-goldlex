import express from 'express';
import mongoose from 'mongoose';
import { createHash, timingSafeEqual } from 'node:crypto';
import Business from '../models/CreditApplication.js';
import Individual from '../models/IndividualCreditApplication.js';
import { requireAdmin, issueAdminToken } from '../middleware/adminAuth.js';
import { applicationSections, label, escapeHtml } from '../utils/applicationDetails.js';
import { sendEmail } from '../utils/notify.js';

const router = express.Router();
const attempts = new Map();
const digest = value => createHash('sha256').update(String(value || '')).digest();
router.post('/login', (req, res) => {
 const now = Date.now();
 for (const [key, item] of attempts) if (item.until < now) attempts.delete(key);
 const attempt = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
 if (attempt.count >= 10) return res.status(429).json({ message: 'Too many login attempts. Try again in 15 minutes.' });
 if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return res.status(503).json({ message: 'Administrator login is not configured on the server.' });
 const validUser = timingSafeEqual(digest(req.body.username), digest(process.env.ADMIN_USERNAME));
 const validPassword = timingSafeEqual(digest(req.body.password), digest(process.env.ADMIN_PASSWORD));
 if (!validUser || !validPassword) {
  attempts.set(req.ip, { ...attempt, count: attempt.count + 1 });
  return res.status(401).json({ message: 'Invalid username or password.' });
 }
 attempts.delete(req.ip);
 res.json({ success: true, token: issueAdminToken() });
});
router.use(requireAdmin);
router.get('/session', (req, res) => res.json({ success: true }));
router.get('/applications', async (req, res, next) => {
 try {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const match = ['business', 'individual'].includes(req.query.type) ? { applicationType: req.query.type } : {};
  const [result] = await Business.aggregate([
   { $addFields: { applicationType: 'business' } },
   { $unionWith: { coll: Individual.collection.name, pipeline: [{ $addFields: { applicationType: 'individual' } }] } },
   { $match: match },
   { $facet: { data: [{ $sort: { createdAt: -1, _id: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }, { $project: { responseLockUntil: 0 } }], count: [{ $count: 'total' }] } },
  ]);
  const total = result.count[0]?.total || 0;
  res.json({ success: true, data: result.data, pagination: { current: page, total, pages: Math.ceil(total / limit) } });
 } catch (error) { next(error); }
});
router.param('type', (req, res, next, type) => {
 if (!['business', 'individual'].includes(type)) return res.status(400).json({ message: 'Invalid application type.' });
 req.applicationModel = type === 'business' ? Business : Individual;
 next();
});
router.param('id', (req, res, next, id) => {
 if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid application reference.' });
 next();
});
router.get('/applications/:type/:id', async (req, res, next) => {
 try {
  const application = await req.applicationModel.findById(req.params.id).lean();
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  const sections = Object.entries(applicationSections[req.params.type]).map(([title, fields]) => ({ title, fields: fields.map(key => ({ key, label: label(key) })) }));
  res.json({ success: true, data: { ...application, applicationType: req.params.type }, sections });
 } catch (error) { next(error); }
});
router.post('/applications/:type/:id/respond', async (req, res, next) => {
 const statuses = { clarification: 'clarification_requested', documents: 'documents_requested', approved: 'approved', rejected: 'rejected' };
 const { kind, subject, message } = req.body;
 if (!Object.hasOwn(statuses, kind) || typeof subject !== 'string' || !subject.trim() || subject.length > 200 || /[\r\n]/.test(subject) || typeof message !== 'string' || !message.trim() || message.length > 10000) {
  return res.status(400).json({ message: 'Select a response type and enter a subject (up to 200 characters) and message (up to 10,000 characters).' });
 }
 let application;
 let emailAccepted = false;
 try {
  application = await req.applicationModel.findOneAndUpdate({ _id: req.params.id, $or: [{ responseLockUntil: { $exists: false } }, { responseLockUntil: null }, { responseLockUntil: { $lt: new Date() } }] }, { $set: { responseLockUntil: new Date(Date.now() + 120000) } }, { new: true });
  if (!application) {
   const exists = await req.applicationModel.exists({ _id: req.params.id });
   return res.status(exists ? 409 : 404).json({ message: exists ? 'A response is already being sent. Please refresh shortly.' : 'Application not found.' });
  }
  const entry = { _id: new mongoose.Types.ObjectId(), kind, subject: subject.trim(), message: message.trim(), recipient: application.emailAddress, delivery: 'sending', createdAt: new Date() };
  await req.applicationModel.updateOne({ _id: application._id }, { $push: { responses: entry } });
  const text = `Dear ${application.fullName},\n\n${entry.message}\n\nApplication reference: ${application._id}\n\nGoldlex Credit Team`;
  const result = await sendEmail(application.emailAddress, entry.subject, text, `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</div>`, { replyTo: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER });
  const sent = result?.sent === true;
  emailAccepted = sent;
  await req.applicationModel.updateOne({ _id: application._id, 'responses._id': entry._id }, { $set: { 'responses.$.delivery': sent ? 'sent' : 'failed', ...(sent ? { 'responses.$.sentAt': new Date(), status: statuses[kind] } : {}) } });
  if (!sent) return res.status(502).json({ code: result?.code || 'EMAIL_SEND_FAILED', message: `Email could not be confirmed as sent. The application status has not changed. ${result?.reason || 'Check email configuration and retry.'}` });
  res.json({ success: true, message: 'Response sent and application status updated.' });
 } catch (error) {
  if (emailAccepted) {
   console.error('Email accepted but review update failed', error);
   return res.status(500).json({ message: 'The email was accepted, but its status could not be saved. Check the sending inbox before retrying to avoid sending a duplicate.' });
  }
  next(error);
 }
 finally {
  if (application) await req.applicationModel.updateOne({ _id: application._id }, { $unset: { responseLockUntil: 1 } }).catch(error => console.error('Could not release response lock', error));
 }
});
export default router;
