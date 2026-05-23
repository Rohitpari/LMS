import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
export const AppContext = createContext();
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate()

    const { getToken } = useAuth()
    const { user } = useUser();
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);
    //fetch courses

    const fetchallcourses = async () => {
        setAllCourses(dummyCourses)
        // const {data}  = await axios.get();
        // console.log(data);

        try {
            const { data } = await axios.get(backendURL + '/api/course/all');
            // console.log(data);
            if (data?.success) {
                // console.log(data);
                setAllCourses(data.courses);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }


    const fetchUserData = async () => {
        if (user.publicMetadata.role === 'educator') {
            setIsEducator(true);
        }
        else{
            setIsEducator(false);
        }
        try {
            const token = await getToken();

            const { data } = await axios.get(backendURL + '/api/user/data', {
                headers:
                    { Authorization: `Bearer ${token}` }
            })

            if (data?.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const calculateRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) return 0;

        let totalRating = 0
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        })
        return Math.floor(totalRating / course.courseRatings.length);
    }

    // chapter Duration 
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    // courses Duration

    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture) => time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    // function calculate to no of lecture of in the

    const calculateNoofLectures = (course) => {
        let totallectures = 0
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totallectures += chapter.chapterContent.length
            }
        })
        return totallectures;

    }

    //fetch user Enrolled courses
    const fetchUserEnrolledCourese = async () => {
        // setEnrolledCourses(dummyCourses);
        try {
            const token = await getToken();
            const { data } = await axios.get(backendURL + '/api/user/enrolled-courses', { headers: { Authorization: `Bearer ${token}` } });
            if (data?.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    useEffect(() => {
        fetchallcourses();
    }, []);


    useEffect(() => {
        if (user) {
            fetchUserData();
        fetchUserEnrolledCourese();

        }
    }, [user])


    const value = {
        currency,
        allCourses, fetchUserEnrolledCourese,
        navigate, enrolledCourses,
        calculateRating,
        isEducator, setIsEducator,
        calculateChapterTime, calculateCourseDuration, calculateNoofLectures,
        backendURL, userData, setUserData, getToken, fetchallcourses

    }; // You can add state and functions to be shared across the app here

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}