const mongoose = require('mongoose');

const studentSchema =new mongoose.Schema({
    studentId: {
        type : String,
        required : true
     },studentName: {
       type : String,
         required : true
        },
    studentEmail: {
       type : String,
       required : true
    },
    studentPassword: {
       type : String,
       required : true
    },
});
//faculty Schema
const facultySchema =new mongoose.Schema({
    facultyId: {
        type : String,
        required : true
     },facultyName: {
       type : String,
         required : true
        },
    facultyEmail: {
       type : String,
       required : true
    },
    facultyPassword: {
       type : String,
       required : true
    },
});

const adminSchema =new mongoose.Schema({
    adminId: {
        type : String,
        required : true
     },
     adminName: {
       type : String,
         required : true
        },
        adminEmail: {
       type : String,
       required : true
    },
    adminPassword: {
       type : String,
       required : true
    },
});
//complaint model
const complaintSchema =new mongoose.Schema({
    studentId :{

    },
    studentName :{

    },
    desc :{
        type : String,
        required : true
    }
})




module.exports = {
Student : mongoose.model('student', studentSchema),
Faculty : mongoose.model('faculty', facultySchema),
Admin :mongoose.model('admin', adminSchema),
Complaint :mongoose.model('complaint',complaintSchema)



}