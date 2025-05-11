const express = require("express");
const nodemailer = require("nodemailer");
const {
    Student,
    Admin,
    Complaint,
    Feedback,
    Otp
} = require("../Models/PortModel");
const createError = require("../Utils/appError");
const session = require('express-session');
require("dotenv").config();

const router = express.Router();

// ========== AUTH MIDDLEWARE ==========
const isAuthenticated = (req, res, next) => {
    if (req.session.email) {
        return next();
    } else {
        return res.status(401).json({ message: "Authentication required" });
    }
};

// ========== NODEMAILER ==========
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ================= OTP Routes ===================
router.post("/otp/send", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        // Check if email exists in any user collection
        const student = await Student.findOne({ studentEmail: email });
        const admin = await Admin.findOne({ adminEmail: email });

        if (!student && !admin) {
            return res.status(404).json({ success: false, message: "Email is not registered" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        await Otp.create({
            email,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otpCode}. It expires in 5 minutes.`,
        });

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, message: "Error sending OTP", error });
    }
});

router.post("/otp/verify", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const validOtp = await Otp.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });
        if (validOtp) {
            await Otp.deleteMany({ email });
            res.json({ success: true, message: "OTP verified successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying OTP", error });
    }
});

router.post("/otp/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "Email and new password are required" });
    }
    try {
        let role = null;
        let updatedUser = null;
        const student = await Student.findOne({ studentEmail: email });
        const admin = await Admin.findOne({ adminEmail: email });

        if (student) {
            student.studentPassword = newPassword;
            updatedUser = await student.save();
            role = "student";
        } else if (admin) {
            admin.adminPassword = newPassword;
            updatedUser = await admin.save();
            role = "admin";
        }

        await Otp.deleteMany({ email });

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            role,
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Error resetting password", error });
    }
});

// ================= Signup/Login Routes ===================
const signupUser = async (Model, role, req, res, next) => {
    try {
        const emailField = role === "student" ? "studentEmail" : "adminEmail";
        const user = await Model.findOne({ [emailField]: req.body.email });
        if (user) {
            return next(createError(400, `${role} already exists`));
        }
        const newUser = await Model.create(req.body);
        res.status(201).json({
            status: "success",
            message: `${role} Registered successfully`,
            user: newUser,
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (Model, role, req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new createError(400, "Email and password are required"));
        }
        let user;
        if (role === "student") {
            user = await Student.findOne({ studentEmail: email, studentPassword: password });
        } else if (role === "admin") {
            user = await Admin.findOne({ adminEmail: email, adminPassword: password });
        }
        if (!user) return next(new createError(401, "Invalid credentials"));
        req.session.email = email;
        req.session.role = role;
        res.status(200).json({
            status: "success",
            message: `${role} logged in successfully`,
            user: user
        });
    } catch (error) {
        next(error);
    }
};

// Signup Routes
router.post("/signup/student", (req, res, next) => signupUser(Student, "student", req, res, next));
router.post("/signup/admin", (req, res, next) => signupUser(Admin, "admin", req, res, next));

// Login Routes
router.post("/login/student", async (req, res, next) => {
    try {
        await loginUser(Student, "student", req, res, next)
    } catch (error) {
        next(error);
    }
});
router.post("/login/admin", async (req, res, next) => {
    try {
        await loginUser(Admin, "admin", req, res, next)
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile/update
router.put("/profile/update", isAuthenticated, async (req, res) => {
    try {
        const email = req.session.email;
        if (!email) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { studentName, studentEmail } = req.body;
        if (!studentName || !studentEmail) {
            return res.status(400).json({ message: "Name and Email are required" });
        }
        const student = await Student.findOne({ studentEmail: email });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        student.studentName = studentName;
        student.studentEmail = studentEmail;
        await student.save();
        if (email !== studentEmail) {
            req.session.email = studentEmail;
        }
        res.status(200).json({ status: "success", message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/debug-session", (req, res) => {
    res.json({ session: req.session });
});

// Logout route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});

// ================= Complaint Routes ===================
router.post("/add-complaint", isAuthenticated, async (req, res, next) => {
    try {
        const complaint = new Complaint(req.body);
        await complaint.save();
        res.status(201).json({
            status: "success",
            message: "Complaint registered successfully",
            complaint,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/get-student-complaints", isAuthenticated, async (req, res, next) => {
    try {
        const email = req.session.email;
        if (!email) {
            return res.status(401).json({ message: "Unauthorized: No email in session" });
        }
        const complaints = await Complaint.find({ studentEmail: email });
        res.status(200).json({ complaints });
    } catch (error) {
        next(error);
    }
});

router.get("/get-complaints", isAuthenticated, async (req, res) => {
    try {
        const complaints = await Complaint.find({});
        const now = new Date();
        const updatePromises = complaints.map(async (complaint) => {
            if (
                complaint.status === "Pending" &&
                (now - new Date(complaint.createdAt)) > 3 * 24 * 60 * 60 * 1000
            ) {
                complaint.status = "Overdue";
                await complaint.save();
            }
        });
        await Promise.all(updatePromises);
        const sortedComplaints = await Complaint.find({}).sort({
        });
        res.json({ complaints: sortedComplaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
});


router.get("/get-complaint/:complaintId", isAuthenticated, async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) {
            return res.status(404).json({ status: "error", message: "Complaint not found" });
        }
        res.status(200).json({ status: "success", complaint });
    } catch (error) {
        next(error);
    }
});

router.post("/update-complaint", isAuthenticated, async (req, res, next) => {
    try {
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true }
        );
        res.status(200).json({
            status: "success",
            message: "Complaint updated successfully",
            updatedComplaint,
        });
    } catch (error) {
        next(error);
    }
});

// ================= ASSIGN COMPLAINT ROUTE ===================
router.post("/assign-complaint", isAuthenticated, async (req, res, next) => {
    try {
        console.log("Assign Complaint Payload:", req.body);
        console.log("Session:", req.session);
        // Only admin can assign
        if (req.session.role !== "admin") {
            return res.status(403).json({ message: "Only admin can assign complaints" });
        }

        const { complaintId, facultyName, facultyEmail } = req.body;
        if (!complaintId || !facultyEmail) {
            return res.status(400).json({ message: "complaintId, facultyEmail, and are required" });
        }

        // Find complaint
        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        // Assign complaint fields
        complaint.assignedTo = facultyEmail;
        complaint.assignedFacultyName = facultyName;
        complaint.assignmentStatus = "Assigned";
        complaint.assignedAt = new Date();
        await complaint.save();

        // Compose email
        const subject = `New Complaint Assigned: ${complaint.subject || complaint.complaintType || "Complaint"}`;
        const text = `
Dear ${facultyName || "Faculty"},

You have been assigned a new complaint.

Complaint ID: ${complaint.complaintId}
Subject: ${complaint.subject || complaint.complaintType}
Description: ${complaint.complaintDesc || complaint.description || "No description"}

Please reply to this emailwith your response/resolution. The admin will update the system accordingly.

Thank you.
`.trim();

        let emailStatus = "Email not sent";

        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: facultyEmail,
                subject,
                text
            });
            console.log('Email sent:', info);
            emailStatus = "Email sent";
        } catch (emailErr) {
            console.error("Email Send Error:", emailErr);
            emailStatus = "Email failed: " + emailErr.message;
        }

        if (emailStatus !== "Email sent") {
            return res.status(500).json({
                message: "Failed to send email",
                emailStatus
            });
        }

        res.status(200).json({
            message: "Complaint assigned. Email sent to faculty.",
            emailStatus
        });

    } catch (error) {
        console.error("Assign Complaint Error:", error);
        next(error);
    }
});

// ================= Feedback Routes ===================
router.post("/add-feedback", async (req, res, next) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json({
            status: "success",
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/get-feedbacks", async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find();
        const feedbacksWithIST = feedbacks.map(fb => ({
            ...fb._doc,
            createdAtIST: fb.createdAt
                ? new Date(fb.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : null
        }));
        res.status(200).json({
            status: "success",
            feedbacks: feedbacksWithIST
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
