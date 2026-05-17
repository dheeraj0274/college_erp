import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Fee from '../models/Fee.js';
import Notification from '../models/Notification.js';
import Timetable from '../models/Timetable.js';
import Result from '../models/Result.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(), Student.deleteMany(), Department.deleteMany(),
      Subject.deleteMany(), Fee.deleteMany(), Notification.deleteMany(),
      Timetable.deleteMany(), Result.deleteMany(), Assignment.deleteMany(),
      Attendance.deleteMany(),
    ]);
    console.log('Cleared existing data');

    const rawPassword = 'admin123';

    const adminUser = await User.create({
      name: 'Admin User', email: 'admin@techverse.edu',
      password: rawPassword, role: 'admin', isVerified: true, isActive: true,
    });

    const departments = await Department.insertMany([
      { name: 'Computer Science', code: 'CS' },
      { name: 'Electronics & Communication', code: 'EC' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Civil Engineering', code: 'CE' },
    ]);
    console.log(`Created ${departments.length} departments`);

    const facultyData = [
      { name: 'Dr. Rajesh Sharma', email: 'sharma@techverse.edu', dept: 0, role: 'hod' },
      { name: 'Prof. Anita Verma', email: 'verma@techverse.edu', dept: 0, role: 'faculty' },
      { name: 'Dr. Suresh Patel', email: 'patel@techverse.edu', dept: 1, role: 'hod' },
      { name: 'Prof. Meena Gupta', email: 'gupta@techverse.edu', dept: 2, role: 'faculty' },
      { name: 'Dr. Vikash Yadav', email: 'yadav@techverse.edu', dept: 3, role: 'hod' },
      { name: 'Prof. Kavita Singh', email: 'kavita@techverse.edu', dept: 0, role: 'faculty' },
      { name: 'Dr. Ravi Kumar', email: 'ravi@techverse.edu', dept: 1, role: 'faculty' },
      { name: 'Prof. Sunita Devi', email: 'sunita@techverse.edu', dept: 2, role: 'hod' },
    ];

    const facultyUsers = [];
    for (const f of facultyData) {
      const user = await User.create({
        name: f.name, email: f.email, password: rawPassword,
        role: f.role, department: departments[f.dept]._id, isVerified: true, isActive: true,
      });
      facultyUsers.push(user);
    }
    console.log(`Created ${facultyUsers.length} faculty members`);

    departments[0].hod = facultyUsers[0]._id;
    departments[1].hod = facultyUsers[2]._id;
    departments[3].hod = facultyUsers[4]._id;
    departments[2].hod = facultyUsers[7]._id;
    await Promise.all(departments.map(d => d.save()));

    const studentNames = [
      'Rahul Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Gupta', 'Vikram Reddy',
      'Ananya Sharma', 'Karthik Nair', 'Meera Joshi', 'Arjun Mehta', 'Pooja Rao',
      'Rohit Verma', 'Divya Kapoor', 'Sunil Yadav', 'Neha Agarwal', 'Rajan Mishra',
      'Swati Pandey', 'Aditya Chowdhury', 'Ishita Sinha', 'Manish Tiwari', 'Ritika Saxena',
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const deptIdx = i % departments.length;
      const semester = [2, 4, 6, 8][i % 4];
      const emailPrefix = studentNames[i].toLowerCase().replace(/\s+/g, '.');
      const user = await User.create({
        name: studentNames[i], email: `${emailPrefix}@techverse.edu`,
        password: rawPassword, role: 'student',
        department: departments[deptIdx]._id, isVerified: true, isActive: i !== 3,
      });
      const student = await Student.create({
        user: user._id, rollNo: `${departments[deptIdx].code}-2024-${String(i + 1).padStart(3, '0')}`,
        department: departments[deptIdx]._id, semester, section: i % 2 === 0 ? 'A' : 'B',
        batch: '2024-2028', admissionYear: 2024,
      });
      students.push(student);
    }
    console.log(`Created ${students.length} students`);

    const subjectData = [
      { name: 'Data Structures & Algorithms', code: 'CS-301', dept: 0, sem: 3, credits: 4, type: 'theory', fac: 0 },
      { name: 'Operating Systems', code: 'CS-302', dept: 0, sem: 3, credits: 4, type: 'theory', fac: 1 },
      { name: 'Database Management Systems', code: 'CS-303', dept: 0, sem: 3, credits: 3, type: 'theory', fac: 5 },
      { name: 'Computer Networks', code: 'CS-304', dept: 0, sem: 3, credits: 3, type: 'theory', fac: 1 },
      { name: 'DSA Lab', code: 'CS-351', dept: 0, sem: 3, credits: 2, type: 'lab', fac: 0 },
      { name: 'Digital Signal Processing', code: 'EC-401', dept: 1, sem: 4, credits: 4, type: 'theory', fac: 2 },
      { name: 'VLSI Design', code: 'EC-402', dept: 1, sem: 4, credits: 3, type: 'theory', fac: 6 },
      { name: 'Engineering Mechanics', code: 'ME-201', dept: 2, sem: 2, credits: 3, type: 'theory', fac: 3 },
      { name: 'Thermodynamics', code: 'ME-301', dept: 2, sem: 3, credits: 4, type: 'theory', fac: 7 },
      { name: 'Web Technologies', code: 'IT-301', dept: 3, sem: 3, credits: 3, type: 'theory', fac: 4 },
    ];

    const subjects = [];
    for (const s of subjectData) {
      const subject = await Subject.create({
        name: s.name, code: s.code, department: departments[s.dept]._id,
        semester: s.sem, credits: s.credits, type: s.type, faculty: facultyUsers[s.fac]._id,
      });
      subjects.push(subject);
    }
    console.log(`Created ${subjects.length} subjects`);

    const feeRecords = [];
    for (const student of students) {
      const statuses = ['paid', 'partial', 'unpaid'];
      const status = statuses[Math.floor(Math.random() * 3)];
      const totalAmount = 120000;
      let paidAmount = 0;
      if (status === 'paid') paidAmount = totalAmount;
      else if (status === 'partial') paidAmount = Math.floor(Math.random() * 80000) + 20000;
      const fee = await Fee.create({
        student: student._id, semester: student.semester, totalAmount, paidAmount, status,
        payments: paidAmount > 0 ? [{ amount: paidAmount, method: 'online', transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` }] : [],
      });
      feeRecords.push(fee);
    }
    console.log(`Created ${feeRecords.length} fee records`);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:15', endTime: '12:15' },
      { startTime: '12:15', endTime: '01:15' },
      { startTime: '02:00', endTime: '03:00' },
      { startTime: '03:00', endTime: '04:00' },
    ];
    const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 204', 'Room 301', 'CS-Lab 1', 'CS-Lab 2'];
    const csSubjects = subjects.filter(s => s.code.startsWith('CS'));

    for (const day of days) {
      const slots = timeSlots.map((ts, idx) => ({
        ...ts,
        subject: csSubjects[idx % csSubjects.length]._id,
        faculty: csSubjects[idx % csSubjects.length].faculty,
        room: rooms[idx % rooms.length],
        type: csSubjects[idx % csSubjects.length].type === 'lab' ? 'lab' : 'lecture',
      }));
      await Timetable.create({ department: departments[0]._id, semester: 3, day, slots });
    }
    console.log('Created timetable entries');

    const examTypes = ['mid-sem', 'internal'];
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
    for (const student of students.slice(0, 10)) {
      for (const subject of subjects.slice(0, 5)) {
        for (const examType of examTypes) {
          const totalMarks = examType === 'mid-sem' ? 50 : 30;
          const obtainedMarks = Math.floor(Math.random() * (totalMarks * 0.5)) + Math.floor(totalMarks * 0.4);
          const pct = obtainedMarks / totalMarks;
          let grade = 'C';
          if (pct >= 0.9) grade = 'A+';
          else if (pct >= 0.8) grade = 'A';
          else if (pct >= 0.7) grade = 'B+';
          else if (pct >= 0.6) grade = 'B';
          await Result.create({
            student: student._id, subject: subject._id, semester: 3, examType,
            totalMarks, obtainedMarks, grade, publishedBy: adminUser._id,
          });
        }
      }
    }
    console.log('Created result records');

    const now = new Date();
    const assignmentData = [
      { title: 'Implement Binary Search Tree', desc: 'Implement BST with insert, delete, search, and traversal operations.', subIdx: 0, days: 7 },
      { title: 'Process Scheduling Simulation', desc: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms.', subIdx: 1, days: 10 },
      { title: 'ER Diagram Design', desc: 'Design an ER diagram for a library management system.', subIdx: 2, days: 5 },
      { title: 'Socket Programming Chat App', desc: 'Build a simple TCP chat application using sockets.', subIdx: 3, days: 14 },
      { title: 'Linked List Operations', desc: 'Implement singly and doubly linked lists with all operations.', subIdx: 4, days: -2 },
    ];
    for (const a of assignmentData) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + a.days);
      const subs = students.slice(0, 8).map((s, i) => ({
        student: s._id,
        submittedAt: new Date(now.getTime() - Math.random() * 86400000 * 3),
        marks: i < 5 ? Math.floor(Math.random() * 30) + 70 : undefined,
        status: i < 5 ? 'graded' : a.days < 0 ? 'late' : 'submitted',
      }));
      await Assignment.create({
        title: a.title, description: a.desc, subject: subjects[a.subIdx]._id,
        department: departments[0]._id, semester: 3, dueDate, totalMarks: 100,
        createdBy: subjects[a.subIdx].faculty, submissions: subs,
      });
    }
    console.log('Created assignments');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const statusOptions = ['present', 'present', 'present', 'present', 'absent', 'late'];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      for (const student of students.slice(0, 10)) {
        for (const subject of subjects.slice(0, 3)) {
          await Attendance.create({
            student: student._id, subject: subject._id, date,
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            markedBy: subject.faculty,
          });
        }
      }
    }
    console.log('Created attendance records');

    await Notification.insertMany([
      { title: 'Mid-Semester Results Published', message: 'Results for CS 3rd semester mid-sem exams are now available.', type: 'info', target: 'all', createdBy: adminUser._id },
      { title: 'Fee Payment Reminder', message: 'Last date for semester fee payment is May 25, 2026.', type: 'warning', target: 'students', createdBy: adminUser._id },
      { title: 'Holiday Notice', message: 'College will remain closed on May 20 for annual day celebrations.', type: 'info', target: 'all', createdBy: adminUser._id },
      { title: 'Assignment Deadline Extended', message: 'DSA Lab assignment deadline extended to May 22.', type: 'success', target: 'students', department: departments[0]._id, createdBy: facultyUsers[0]._id },
      { title: 'Low Attendance Warning', message: '23 students have attendance below 75%. Immediate action required.', type: 'danger', target: 'faculty', createdBy: adminUser._id },
    ]);
    console.log('Created notifications');

    console.log('\n=== Seed Complete ===');
    console.log('Admin login: admin@techverse.edu / admin123');
    console.log('Faculty login: sharma@techverse.edu / admin123');
    console.log('Student login: rahul.kumar@techverse.edu / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
