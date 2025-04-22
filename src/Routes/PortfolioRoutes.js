const express = require("express");
const nodemailer = require("nodemailer");
const { Student, Faculty, Admin, Complaint, Otp } = require("../Models/PortModel");
const createError = require("../utils/appError");
require("dotenv").config();

const router = express.Router();

// Nodemailer transporter config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ================= OTP Routes ===================

// ✅ Send OTP
// router.post("/otp/send", async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//       }
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

//     try {
//         await Otp.create({
//             email,
//             otp: otpCode,
//             expiresAt: new Date(Date.now() + 5 * 60000),
//         });

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Your OTP Code",
//             text: `Your OTP is ${otpCode}. It expires in 5 minutes.`,
//         });

//         res.json({ success: true, message: "OTP sent successfully!" });
//     } catch (error) {
//         console.error("OTP Send Error:", error); // Add this line
//         res.status(500).json({ success: false, message: "Error sending OTP", error });
//     }
// });

// ✅ Verify OTP
router.post("/otp/send", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        // Check if email exists in any user collection
        const student = await Student.findOne({ studentEmail: email });
        const faculty = await Faculty.findOne({ facultyEmail: email });
        const admin = await Admin.findOne({ adminEmail: email });

        if (!student && !faculty && !admin) {
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

//verify OTP
router.post("/otp/verify", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const validOtp = await Otp.findOne({ email, otp, expiresAt: { $gt: new Date() } });

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

// ✅ Reset Password After OTP Verification
// ✅ Reset Password After OTP Verification
router.post("/otp/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "Email and new password are required" });
    }

    try {
        let role = null;
        let updatedUser = null;

        const student = await Student.findOne({ studentEmail: email });
        const faculty = await Faculty.findOne({ facultyEmail: email });
        const admin = await Admin.findOne({ adminEmail: email });

        if (student) {
            student.studentPassword = newPassword;
            updatedUser = await student.save();
            role = "student";
        } else if (faculty) {
            faculty.facultyPassword = newPassword;
            updatedUser = await faculty.save();
            role = "faculty";
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
        const user = await Model.findOne({ email: req.body.email });
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
        const { studentEmail, studentPassword } = req.body;
        if (!studentEmail || !studentPassword) {
            return next(new createError(400, "Email and password are required"));
        }
        const user = await Model.findOne({ studentEmail, studentPassword });
        if (!user) return next(new createError(401, "Invalid credentials"));
        res.status(200).json({
            status: "success",
            message: `${role} logged in successfully`,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Signup Routes
router.post("/signup/student", (req, res, next) => signupUser(Student, "Student", req, res, next));
router.post("/signup/faculty", (req, res, next) => signupUser(Faculty, "Faculty", req, res, next));
router.post("/signup/admin", (req, res, next) => signupUser(Admin, "Admin", req, res, next));

// Login Routes
router.post("/login/student", (req, res, next) => loginUser(Student, "Student", req, res, next));
router.post("/login/faculty", (req, res, next) => loginUser(Faculty, "Faculty", req, res, next));
router.post("/login/admin", (req, res, next) => loginUser(Admin, "Admin", req, res, next));

// ================= Complaint Routes ===================

router.post("/add-complaint", async (req, res, next) => {
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

router.get("/get-complaints", async (req, res, next) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json({ complaints });
    } catch (error) {
        next(error);
    }
});

router.post("/update-complaint", async (req, res, next) => {
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

router.post("/delete-complaint", async (req, res, next) => {
    try {
        const { id } = req.body;

        if (!id) {
            return next(createError(400, "Complaint ID is required"));
        }

        const deletedComplaint = await Complaint.findByIdAndDelete(id);

        if (!deletedComplaint) {
            return next(createError(404, "Complaint not found"));
        }

        res.status(200).json({
            status: "success",
            message: "Complaint deleted successfully",
            deletedComplaint,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;