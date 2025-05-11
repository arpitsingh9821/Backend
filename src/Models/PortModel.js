const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

// ================= Student Schema =================
const studentSchema = new mongoose.Schema({
    studentId: { type: Number, unique: true, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true, unique: true },
    studentPassword: { type: String, required: true },
});

// ================= Admin Schema =================
const adminSchema = new mongoose.Schema({
    adminId: { type: Number, required: true },
    adminEmail: { type: String, required: true },
    adminPassword: { type: String, required: true },
});

// ================= Complaint Schema =================
const complaintSchema = new mongoose.Schema({
    complaintId: { type: String, unique: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    studentEmail: { type: String, required: true },
    complaintType: { type: String, required: true },
    complaintDesc: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    category: { type: String, enum: ["Academic", "Administrative", "Facility", "Other"], default: "Other" },
    assignedTo: { type: String, default: null },          // faculty email
    assignedFacultyName: { type: String, default: null }, // faculty name
    assignmentStatus: { type: String, default: null },    // e.g. "Assigned"
    assignedAt: { type: Date, default: null }
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

// ================= Feedback Schema =================
const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    complaintId: { type: String, required: true },
    rating: { type: Number, required: true },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for feedback
feedbackSchema.index({ 'ratings.overall': 1 });
feedbackSchema.index({ submissionDate: -1 });

// Create models
const Student = mongoose.model("Student", studentSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = {
    Otp: mongoose.model("OTP", otpSchema),
    Student,
    Admin,
    Complaint,
    Feedback
};