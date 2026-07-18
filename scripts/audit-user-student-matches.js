/*
Audit script: find Users whose email matches zero or multiple Student documents (case-insensitive).
Outputs CSV to ./scripts/audit-user-student-matches.csv

Usage:
  MONGO_URI="mongodb://localhost:27017/unizik-lms" node scripts/audit-user-student-matches.js

Make sure Node.js is installed and run this from the repo root.
*/

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unizik-lms-report';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Auto-detect collection names (match case-insensitively)
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);
  console.log('Detected collections:', names.join(', '));

  const userColl = names.find(n => /user/i.test(n)) || 'users';
  const studentColl = names.find(n => /student/i.test(n)) || 'students';
  const reportColl = names.includes('reports') ? 'reports' : names.find(n => /report/i.test(n)) || 'reports';

  console.log('Using collections -> user:', userColl, ', student:', studentColl, ', report:', reportColl);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), userColl);
  const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({}, { strict: false }), studentColl);
  const Report = mongoose.models.Report || mongoose.model('Report', new mongoose.Schema({}, { strict: false }), reportColl);

  const users = await User.find({}).lean();
  console.log('Found', users.length, 'users');

  const rows = [];
  rows.push('userId,userName,userEmail,matchedStudentCount,matchedStudentIds,matchedStudentNames,matchedStudentEmails,matchedReportIds');

  for (const u of users) {
    const email = u.email ? String(u.email).trim() : '';
    if (!email) continue;
    const regex = new RegExp(`^${escapeRegExp(email)}$`, 'i');
    const matchedStudents = await Student.find({ email: regex }).lean();
    const matchedCount = matchedStudents.length;
    const studentIds = matchedStudents.map(s => String(s._id)).join('|');
    const studentNames = matchedStudents.map(s => (s.fullName || '').replace(/,/g, ' ')).join('|');
    const studentEmails = matchedStudents.map(s => s.email || '').join('|');

    // collect report ids for matched students
    let reportIds = [];
    if (matchedStudents.length > 0) {
      const sIds = matchedStudents.map(s => s._id);
      const reports = await Report.find({ studentId: { $in: sIds } }).lean();
      reportIds = reports.map(r => String(r._id));
    }

    if (matchedCount !== 1) {
      rows.push([String(u._id), (u.name || '').replace(/,/g, ' '), email, String(matchedCount), studentIds, studentNames, studentEmails, reportIds.join('|')].map(v => `"${v}"`).join(','));
    }
  }

  const outPath = path.join(__dirname, 'audit-user-student-matches.csv');
  fs.writeFileSync(outPath, rows.join('\n'));
  console.log('Wrote', outPath);
  // Now do reverse scan: Students without matching Users
  const studentRows = [];
  studentRows.push('studentId,studentName,studentEmail,matchedUserCount,matchedUserIds,matchedUserNames');
  const allStudents = await Student.find({}).lean();
  for (const s of allStudents) {
    const semail = s.email ? String(s.email).trim() : '';
    if (!semail) continue;
    const regex = new RegExp(`^${escapeRegExp(semail)}$`, 'i');
    const matchedUsers = await User.find({ email: regex }).lean();
    const ucount = matchedUsers.length;
    if (ucount === 0) {
      studentRows.push([String(s._id), (s.fullName || s.name || '').replace(/,/g, ' '), semail, String(ucount), '', ''].map(v => `"${v}"`).join(','));
    }
  }
  const sOut = path.join(__dirname, 'students-without-users.csv');
  fs.writeFileSync(sOut, studentRows.join('\n'));
  console.log('Wrote', sOut);

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
