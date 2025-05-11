const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Student, Faculty, Admin } = require('../Models/PortModel');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.email && req.session.role) {
        next();
    } else {
        res.status(401).json({ status: "error", message: "Unauthorized" });
    }
}

// Simplified helper function (email-only)
async function fetchByEmail(model, email) {
    if (!email) throw new Error('Email required');
    const doc = await model.findOne({ email }).lean();
    return doc;
}

router.get("/profile", isAuthenticated, async (req, res) => {
    // Access user information from session
    const email = req.session.email;
    const userRole = req.session.role;

    try {
        let user;
        if (userRole === "student") {
            user = await Student.findOne({ studentEmail: email });
        } else if (userRole === "faculty") {
            user = await Faculty.findOne({ facultyEmail: email });
        } else if (userRole === "admin") {
            user = await Admin.findOne({ adminEmail: email });
        }

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: `Profile not found for email ${email}`
            });
        }

        res.status(200).json({
            status: "success",
            message: `Profile data for ${userRole} with email ${email}`,
            user: user,
            role: userRole
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch profile",
            error: error
        });
    }
});

module.exports = router;
