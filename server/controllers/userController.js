


import Course from "../models/Course.js";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import { CourseProgress } from "../models/CourseProgress.js";

/* =========================
   GET USER DATA
========================= */
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log("getUserData error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   USER ENROLLED COURSES
========================= */
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const userData = await User.findById(userId).populate("enrolledCourses");

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    console.log("userEnrolledCourses error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   PURCHASE COURSE
========================= */
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    if (!courseId || !userId) {
      return res.json({ success: false, message: "Invalid request data" });
    }

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const finalAmount =
      courseData.coursePrice -
      (courseData.discount * courseData.coursePrice) / 100;

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: Number(finalAmount.toFixed(2)),
    };

    const newPurchase = await Purchase.create(purchaseData);

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.round(newPurchase.amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log("purchaseCourse error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   UPDATE COURSE PROGRESS
========================= */
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    if (!userId || !courseId || !lectureId) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture already completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Lecture progress updated" });
  } catch (error) {
    console.log("updateUserCourseProgress error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   GET COURSE PROGRESS
========================= */
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res.json({ success: false, message: "Invalid data" });
    }

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({ success: true, progressData });
  } catch (error) {
    console.log("getUserCourseProgress error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   ADD USER RATING
========================= */
export const addUserRating = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course Not Found" });
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased the course",
      });
    }

    const existingRatingIndex = course.courseRating.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      course.courseRating[existingRatingIndex].rating = rating;
    } else {
      course.courseRating.push({ userId, rating });
    }

    await course.save();

    res.json({ success: true, message: "Rating added successfully" });
  } catch (error) {
    console.log("addUserRating error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
