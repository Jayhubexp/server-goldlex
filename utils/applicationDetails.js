export const applicationSections = {
 business: {
  'Business information': ['businessName', 'yearsInBusiness', 'registrationNumber', 'businessType', 'businessAddress', 'industry', 'averageMonthlyRevenue'],
  'Contact information': ['fullName', 'phoneNumber', 'emailAddress'],
  'Funding request': ['desiredCreditAmount', 'additionalInfo'],
  'Bank information': ['bankName', 'bankAccountNumber'],
  'Guarantor information': ['guarantorName', 'guarantorPhone'],
 },
 individual: {
  'Personal information': ['surname', 'otherNames', 'fullName', 'dob', 'age', 'idType', 'idNumber', 'maritalStatus', 'gender'],
  'Contact information': ['phoneNumber', 'emailAddress'],
  'Employment information': ['employmentStatus', 'placeOfWork', 'occupation'],
  'Funding request': ['desiredCreditAmount', 'reasonForFunding', 'loanDurationMonths'],
  'Bank information': ['bankName', 'bankAccountNumber'],
  'Supporting documents': ['paySlipUrl'],
 },
};

export const label = (key) => ({ dob: 'Date of birth', idType: 'ID type', idNumber: 'ID number', paySlipUrl: 'Pay slip', additionalInfo: 'Reason for funding', desiredCreditAmount: 'Requested amount (GHS)', averageMonthlyRevenue: 'Average monthly revenue (GHS)' }[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()));
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const display = (value) => value === undefined || value === null || value === '' ? 'Not provided' : value instanceof Date ? value.toISOString().slice(0, 10) : String(value);

export function applicationEmail(application, type) {
 const title = `New ${type} credit application`;
 const sections = { 'Application summary': ['_id', 'createdAt', 'status'], ...applicationSections[type] };
 let text = `${title}\n`;
 let html = `<div style="font-family:Arial,sans-serif;max-width:720px;color:#1f2937"><h1>${title}</h1>`;
 for (const [heading, fields] of Object.entries(sections)) {
  text += `\n${heading}\n${'-'.repeat(heading.length)}\n`;
  html += `<h2 style="font-size:18px;margin-top:24px">${heading}</h2><table style="border-collapse:collapse;width:100%">`;
  for (const field of fields) {
   const name = field === '_id' ? 'Application reference' : label(field);
   const value = display(application[field]);
   text += `${name}: ${value}\n`;
   html += `<tr><th style="text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #ddd;width:40%">${name}</th><td style="padding:10px;border-bottom:1px solid #ddd;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`;
  }
  html += '</table>';
 }
 return { subject: `${title}: ${application.businessName || application.fullName}`.replace(/[\r\n]/g, ' '), text, html: html + '</div>' };
}
