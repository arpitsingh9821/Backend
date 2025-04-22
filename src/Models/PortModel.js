const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

// ================= Student Schema =================
const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true, unique: true },
    studentPassword: { type: String, required: true },
});

// Auto-generate studentId like STUD001
studentSchema.pre("save", async function (next) {
    if (!this.studentId) {
        const lastStudent = await Student.findOne().sort({ studentId: -1 });
        let nextId = "STUD001";

        if (lastStudent && lastStudent.studentId) {
            const lastNumber = parseInt(lastStudent.studentId.replace("STUD", ""), 10);
            nextId = `STUD${String(lastNumber + 1).padStart(3, "0")}`;
        }

        this.studentId = nextId;
    }
    next();
});

// ================= Faculty Schema =================
const facultySchema = new mongoose.Schema({
    facultyId: { type: String, unique: true },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    facultyPassword: { type: String, required: true },
});

// Auto-generate facultyId like FACL001
facultySchema.pre("save", async function (next) {
    if (!this.facultyId) {
        const lastFaculty = await Faculty.findOne().sort({ facultyId: -1 });
        let nextId = "FACL001";

        if (lastFaculty && lastFaculty.facultyId) {
            const lastNumber = parseInt(lastFaculty.facultyId.replace("FACL", ""), 10);
            nextId = `FACL${String(lastNumber + 1).padStart(3, "0")}`;
        }

        this.facultyId = nextId;
    }
    next();
});

// ================= Admin Schema =================
const adminSchema = new mongoose.Schema({
    adminId: { type: String, unique: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    adminPassword: { type: String, required: true },
});

// Auto-generate adminId like ADMN001
adminSchema.pre("save", async function (next) {
    if (!this.adminId) {
        const lastAdmin = await Admin.findOne().sort({ adminId: -1 });
        let nextId = "ADMN001";

        if (lastAdmin && lastAdmin.adminId) {
            const lastNumber = parseInt(lastAdmin.adminId.replace("ADMN", ""), 10);
            nextId = `ADMN${String(lastNumber + 1).padStart(3, "0")}`;
        }

        this.adminId = nextId;
    }
    next();
});

// ================= Complaint Schema =================
const complaintSchema = new mongoose.Schema({
    complaintId: { type: String, unique: true },
    ComplaintStatus: { type: String, default: "Pending" },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    desc: { type: String, required: true },
});

// Auto-generate complaintId like COMP001
complaintSchema.pre("save", async function (next) {
    if (!this.complaintId) {
        const lastComplaint = await Complaint.findOne().sort({ complaintId: -1 });
        let nextId = "COMP001";

        if (lastComplaint && lastComplaint.complaintId) {
            const lastNumber = parseInt(lastComplaint.complaintId.replace("COMP", ""), 10);
            nextId = `COMP${String(lastNumber + 1).padStart(3, "0")}`;
        }

        this.complaintId = nextId;
    }
    next();
});

// Create models
const Student = mongoose.model("Student", studentSchema);
const Faculty = mongoose.model("Faculty", facultySchema);
const Admin = mongoose.model("Admin", adminSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = {
    Otp: mongoose.model("OTP", otpSchema),
    Student,
    Faculty,
    Admin,
    Complaint,
};
