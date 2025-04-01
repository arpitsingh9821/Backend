const router = require('express').Router();
const { Student, Faculty, Admin, Complaint } = require('../Models/PortModel');
const createError = require('../utils/appError');
require('dotenv').config();

// Generic Signup Route
const signupUser = async (Model, role, req, res, next) => {
    try {
        const user = await Model.findOne({ email: req.body.email });
        if (user) {
            return next(createError(400, `${role} already exists`));
        }
        const newUser = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            message: `${role} Registered successfully`,
            user: newUser
        });
    } catch (error) {
        next(error);
    }
};

// Generic Login Route
const loginUser = async (Model, role, req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(createError(400, 'Email and password are required'));
        }
        const user = await Model.findOne({ email, password });
        if (!user) return next(createError(401, 'Invalid credentials'));
        res.status(200).json({
            status: 'success',
            message: `${role} logged in successfully`,
            user
        });
    } catch (error) {
        next(error);
    }
};

// Signup Routes
router.post('/signup/student', (req, res, next) => signupUser(Student, 'Student', req, res, next));
router.post('/signup/faculty', (req, res, next) => signupUser(Faculty, 'Faculty', req, res, next));
router.post('/signup/admin', (req, res, next) => signupUser(Admin, 'Admin', req, res, next));

// Login Routes
router.post('/login/student', (req, res, next) => loginUser(Student, 'Student', req, res, next));
router.post('/login/faculty', (req, res, next) => loginUser(Faculty, 'Faculty', req, res, next));
router.post('/login/admin', (req, res, next) => loginUser(Admin, 'Admin', req, res, next));

// Complaint Routes
router.post('/add-complaint', async (req, res, next) => {
    try {
        const complaint = new Complaint(req.body);
        await complaint.save();
        res.status(201).json({
            status: 'success',
            message: 'Complaint registered successfully',
            complaint
        });
    } catch (error) {
        next(error);
    }
});

router.get('/get-complaints', async (req, res, next) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json({ complaints });
    } catch (error) {
        next(error);
    }
});

router.post('/update-complaint', async (req, res, next) => {
    try {
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true }
        );
        res.status(200).json({
            status: 'success',
            message: 'Complaint updated successfully',
            updatedComplaint
        });
    } catch (error) {
        next(error);
    }
});

router.post('/delete-complaint', async (req, res, next) => {
    try {
        const { id } = req.body; // Extract complaint ID

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
            deletedComplaint
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
