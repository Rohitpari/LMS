import { createContext, useEffect ,useState} from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
export const AppContext = createContext();
import {useAuth,useUser} from '@clerk/clerk-react'

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY ;
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    //fetch courses

    const fetchallcourses = async () => {
        setAllCourses(dummyCourses)
    }

    const calculateRating  = (course)=>{
        if(course.courseRatings.length ===0) return 0;

        let totalRating = 0
        course.courseRatings.forEach((rating)=>{
            totalRating += rating.rating;
        })
        return totalRating / course.courseRatings.length;
    }
        
    // chapter Duration
        const calculateChapterTime = (chapter)=>{
        let time = 0 
        chapter.chapterContent.map((lecture)=>time += lecture.lectureDuration)
        return humanizeDuration(time *60 * 1000, {units : ['h', 'm']})
    }

    // courses Duration

    const calculateCourseDuration = (course)=>{
        let time = 0
        course.courseContent.map((chapter)=>chapter.chapterContent.map((lecture)=>time += lecture.lectureDuration))
        return humanizeDuration (time * 60 * 1000, {units : ['h', 'm']}) 
    }

    // function calculate to no of lecture of in the

    const calculateNoofLectures = (course)=>{
        let totallectures = 0
        course.courseContent.forEach(chapter=>{
            if(Array.isArray(chapter.chapterContent)){
                totallectures += chapter.chapterContent.length
            }
        })
        return totallectures;

    }

    //fetch user Enrolled courses
    const fetchUserEnrolledCourese = async()=>{
        setEnrolledCourses(dummyCourses);
    }


    useEffect(() => {
        fetchallcourses();
        fetchUserEnrolledCourese();
    }, []); 

    const logToken = async ()=>{
        console.log(await getToken());
    }
    useEffect(()=>{
        if(user){
            logToken();
        }
    },[user])


    const value = {
        currency,
        allCourses,fetchUserEnrolledCourese,
        navigate,enrolledCourses,
        calculateRating,isEducator, setIsEducator ,
         calculateChapterTime, calculateCourseDuration, calculateNoofLectures
        
    }; // You can add state and functions to be shared across the app here

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}