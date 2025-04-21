const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

// Student Schema
const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentPassword: { type: String, required: true },
});

// Faculty Schema
const facultySchema = new mongoose.Schema({
    facultyId: { type: String, required: true },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    facultyPassword: { type: String, required: true },
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    adminPassword: { type: String, required: true },
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
    complaintId: { type: String, unique: true },
    ComplaintStatus: { type: String, default: "Pending" },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    desc: { type: String, required: true },
});

// Auto-generate `complaintId` in "COMP001", "COMP002" format
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

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = {
    Otp : mongoose.model("OTP", otpSchema),
    Student: mongoose.model("Student", studentSchema),
    Faculty: mongoose.model("Faculty", facultySchema),
    Admin: mongoose.model("Admin", adminSchema),
    Complaint,
};
