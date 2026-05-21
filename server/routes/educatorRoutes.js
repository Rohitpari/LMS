import express from 'express'
import { AddCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorControlller.js'
import upload from '../config/multer.js'
import { requireAuth } from "@clerk/express";
import { protectEducator } from '../middlewares/authMiddleware.js'
// import Course from '../models/Course.js' 

const educatorRouter = express.Router()

//add  EducatorvRole


// import { requireAuth } from "@clerk/express";
educatorRouter.get('/update-role', requireAuth(), updateRoleToEducator)
// educatorRouter.get('/update-role',protectEducator,updateRoleToEducator)
educatorRouter.post('/add-course',upload.single('image') ,protectEducator,AddCourse)
educatorRouter.get('/courses',protectEducator,getEducatorCourses)
educatorRouter.get('/dashboard',protectEducator,educatorDashboardData)
educatorRouter.get('/enrolled-students',protectEducator,getEnrolledStudentsData)


export default educatorRouter; 

