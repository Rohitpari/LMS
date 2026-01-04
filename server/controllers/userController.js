
import Course from "../models/Course.js"
import User from "../models/User.js"
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import { CourseProgress } from "../models/CourseProgress.js";
import { AddCourse } from "./educatorControlller.js";


export const getUserData = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if(!user){
            return res.json({success:false,message : 'User Not Found'})
        }
        res.json({success : true,user})
    } catch (error) {
        console.log('this side from getUserData');
        res.json({success : false,message:error.message})
    }
}

// User Enrolled Courses with lectue Links

export const userEnrolledCourses = async(req,res)=>{
    try {
        const {userId} = req.auth()
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({success:true,enrolledCourses : userData.enrolledCourses })        

    } catch (error) {
        console.log('this side from userEnrolledCourses');
        res.json({success:false,message : error.message})
    }
}


// // Purchase Course

export const purchaseCourse = async(req,res)=>{
    try {
        const {courseId} = req.body
        const {origin} = req.headers
        const {userId} = req.auth()
        // const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            return res.json({success:false,message:'Data not Found'})
        }
        const purchaseData = {
             courseId : courseData._id,
             userId,
             amount : (courseData.coursePrice - courseData.discount * 
                courseData.coursePrice/100).toFixed(2),

        }
        const newPurchase = await Purchase.create(purchaseData)

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLowerCase()

        // cREATEING LINE ITEMS TO FOR sTRIPE

        const line_items = [{
            price_data:{
                currency,
                product_data : {
                    name : courseData.courseTitle
                },
                unit_amount : Math.floor(newPurchase.amount) * 100
            },
            quantity :1
        }]
        const session =await stripeInstance.checkout.sessions.create({
            success_url :`${origin}/my-enrollments`,
            cancel_url : `${origin}/`,
            line_items : line_items,
            mode : "payment",
            metadata : {
                purchaseId : newPurchase._id.toString()
            }
        })
        res.json({success : true, session_url: session.url})      

    } catch (error) {
        console.log("this side from purchaseCourse");
        
        res.json({success : false,message:error.message})
    }
}




// update Usercourse Progress 

export const updateUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId,lectureId} = req.body

        const progeressData = await CourseProgress.findOne({userId,courseId})
        if(progeressData){
            if(!progeressData.lectureCompleted.includes(lectureId)){
                return res.json({success:true,message:'Lecture already completed'})
            }
            progeressData.lectureCompleted.push(lectureId)
            
            await progeressData.save()
        }else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted : [lectureId]
            })
            res.json({success:true,message:'Lecture progress updated'})
        }
    } catch (error) {
        console.log("this side from updateUserCourseProgress");
        res.json({success:false,message:error.message})
    }
}


export const getUserCourseProgress = async(req,res)=>{
    try {
        const userId  = req.auth.userId
        const {courseId,lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId,courseId})
        res.json({success:true,progressData})
    } catch (error) {
        log("this side from getUserCourseProgress");
        res.json({success:false,message:error.message})
    }
}



// Add User Rating To Course

export const addUserRating = async(req,res)=>{
    const userId = req.auth.userId
    const {courseId,rating} = req.body  

    if(!courseId || !userId || rating<1 || rating>5){
        return res.json({success:false,message:'Invalid Data'})
    }
    
    try {
        const course = await Course.findById(courseId);
        if(!course){
            return res.json({success:false,message:'Course Not Found'})
        }

        const user = await User.findById(userId)
        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success:false,message:'User has not purchased the course'})
        }

        const existingRatingIndex = course.courseratings.findIndex(r => r.userId.toString() === userId);
        if(existingRatingIndex > -1){
            course.courseratings[existingRatingIndex].rating = rating;
        }else{
            course.courseratings.push({userId,rating})
        }
        await course.save();
        res.json({success:true,message:'Rating added successfully'})
    } catch (error) {
        console.log("this side from addUserRating");
        res.json({success:false,message:error.message})
    }
}