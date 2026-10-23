import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
const fallbackSecret = randomBytes(32).toString('hex');
const sign = value => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || fallbackSecret).update(value).digest('hex');
export function issueAdminToken() {
 const payload = Buffer.from(JSON.stringify({ expires: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
 return `${payload}.${sign(payload)}`;
}
export function requireAdmin(req, res, next) {
 try {
  const [payload, signature, extra] = (req.headers.authorization || '').replace(/^Bearer /, '').split('.');
  const expected = sign(payload || '');
  if (extra || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) || JSON.parse(Buffer.from(payload, 'base64url').toString()).expires <= Date.now()) throw new Error();
  next();
 } catch {
  res.status(401).json({ success: false, message: 'Please sign in again to review applications.' });
 }
}
