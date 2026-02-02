



// // export default CourseDetails

// import React, { useContext, useEffect, useState } from 'react'
// import { AppContext } from '../../context/AppContext'
// import { useParams } from 'react-router-dom'
// import Loading from '../../components/students/Loading'
// import { assets } from '../../assets/assets'
// import humanizeDuration from 'humanize-duration'
// import Footer from '../../components/students/Footer'
// import Youtube from 'react-youtube'
// import { toast } from 'react-toastify'
// import axios from 'axios'

// function CourseDetails() {
//   const { id } = useParams()
//   const [courseData, setCourseData] = useState(null)
//   const [openSections, setOpenSections] = useState({})
//   const [isAlreadyEnrolled, setisAlreadyEnrolled] = useState(false)
//   const [playerData, setplayerData] = useState(null)

//   const {
//     calculateRating,
//     calculateChapterTime,
//     currency,
//     calculateCourseDuration,
//     calculateNoofLectures,
//     userData,
//     backendURL,
//     getToken
//   } = useContext(AppContext)

//   const fetchCourseData = async () => {
//     try {
//       const { data } = await axios.get(backendURL + '/api/course/' + id)
//       if (data.success) {
//         setCourseData(data.courseData)
//       } else {
//         toast.error(data.message);
//         // console.log("Error fetching course");
//       }
//     } catch (error) {
//       toast.error(error.message);
//       // console.log("Error:", error.message);
//     }
//   }

//   const enrolledCourse = async () => {
//     try {
//       if (!userData) {
//         return toast.warn('Please login to continue')
//       }
//       if (isAlreadyEnrolled) {
//         return toast.warn('already enrolled')
//       }

//       const token = await getToken();
      
//       if (!courseData?._id) {
//         return console.log("courseData._id is missing");
//       }

//       const { data } = await axios.post(backendURL + '/api/user/purchase', 
//         { courseId: courseData._id }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       console.log("Backend Full Response:", data);

//       if (data.success) {
//         // ✅ BACKEND SE 'session_url' AA RAHA HAI, TOH YAHAN BHI WAHI LIKHO
//         const { session_url } = data 
        
//         if (session_url) {
//           window.location.replace(session_url)
//         } else {
//           toast.error("Stripe URL not found in backend response");
//         }
//       } else {
//         toast.error(data.message);
//       }

//     } catch (error) {
//       toast.error(error.message);
//       console.error(error);
//     }
//   }

//   useEffect(() => {
//     fetchCourseData();
//   }, [id])

//   useEffect(() => {
//     if (userData?.enrolledCourses && courseData?._id) {
//       setisAlreadyEnrolled(userData.enrolledCourses.map(String).includes(String(courseData._id)));
//     }
//   }, [userData, courseData, id])

//   const toggleSection = (index) => {
//     setOpenSections(prev => ({
//       ...prev,
//       [index]: !prev[index],
//     }))
//   }

//   return courseData ? (
//     <>
//       <div className="relative min-h-screen">
//         <div className="absolute top-0 left-0 w-full h-section-height z-[-1] bg-gradient-to-b from-cyan-100/70 to-white" />
//         <div className="flex md:flex-row flex-col-reverse gap-5 relative items-start justify-between md:px-36 px-8 pt-20 md:pt-38 text-left">
          
//           <div className="md:w-2/3 w-full max-w-xl text-gray-500 ">
//             <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
//               {courseData.courseTitle}
//             </h1>
//             <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }} />
            
//             <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
//               <p>{calculateRating(courseData)}</p>
//               <div className="flex">
//                 {[...Array(5)].map((_, i) => (
//                   <img key={i} className="w-3.5 h-3.5" src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="star" />
//                 ))}
//               </div>
//               <p>{courseData.enrolledStudents?.length || 0} students</p>
//             </div>
//             <p className="text-sm">course by <span className="text-blue-600 underline">{courseData.educator?.name}</span></p>

//             <div className="pt-8 text-gray-800">
//               <h2 className="text-lg font-semibold">Course Structure</h2>
//               <div className="pt-5">
//                 {courseData.courseContent?.map((chapter, index) => (
//                   <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
//                     <div onClick={() => toggleSection(index)} className="flex items-center justify-between px-4 py-3 cursor-pointer">
//                       <div className="flex items-center gap-2">
//                         <img src={assets.down_arrow_icon} className={`transition-transform ${openSections[index] ? 'rotate-180' : ''}`} alt="" />
//                         <p className="font-medium">{chapter.chapterTitle}</p>
//                       </div>
//                       <p className="text-sm">{chapter.chapterContent?.length} lectures· {calculateChapterTime(chapter)}</p>
//                     </div>
//                     <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
//                       <ul className="border-t border-gray-300 px-4 py-2">
//                         {chapter.chapterContent?.map((lecture, i) => (
//                           <li key={i} className="flex justify-between items-center py-1">
//                             <div className="flex items-center gap-2">
//                               <img src={assets.play_icon} className="w-4 h-4" alt="" />
//                               <p>{lecture.lectureTitle}</p>
//                             </div>
//                             <div className="flex items-center gap-3 text-sm">
//                               {lecture.isPreviewFree && lecture.lectureUrl && (
//                                 <p onClick={() => setplayerData({ videoId: lecture.lectureUrl.split('/').pop() })} className="text-blue-500 cursor-pointer">Preview</p>
//                               )}
//                               <span>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</span>
//                             </div>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="md:w-1/3 w-full course-card z-10 custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
//             {playerData ? (
//               <Youtube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full aspect-video' />
//             ) : (
//               <img className=" md:w-full shadow-lg" src={courseData.courseThumbnail} alt="course" />
//             )}
//             <div className="pt-5 flex items-center gap-2 ml-2">
//               <img className="w-3.5" src={assets.time_left_clock_icon} alt="" />
//               <p className="text-red-500 text-sm"><span className="font-medium">5 days</span> left at this price!</p>
//             </div>
//             <div className='flex gap-3 items-center pt-2 ml-2'>
//               <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}</p>
//               <p className='md:text-lg text-gray-500 line-through '>{currency}{courseData.coursePrice}</p>
//               <p className='md:text-lg text-gray-500'>{courseData.discount}% off</p>
//             </div>
//             <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
//               <div className='flex items-center gap-1 ml-2'><img src={assets.star} alt="star" /><p>{calculateRating(courseData)}</p></div>
//               <div className='h-4 w-px bg-gray-500/40'></div>
//               <div className='flex items-center gap-1'><img src={assets.time_clock_icon} alt="clock" /><p>{calculateCourseDuration(courseData)}</p></div>
//               <div className='h-4 w-px bg-gray-500/40'></div>
//               <div className='flex items-center gap-1'><img src={assets.lesson_icon} alt="lesson" /><p>{calculateNoofLectures(courseData)} lessons</p></div>
//             </div>
//             <button onClick={enrolledCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>{isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}</button>
//             <div className='pt-6 ml-2'>
//               <p className='md:text-lg text-lg font-medium text-gray-800'>What's in the course?</p>
//               <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
//                 <li>LifeTime access with free updates</li>
//                 <li>Step-by-step guidance.</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   ) : <Loading />
// }

// export default CourseDetails








import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import Loading from '../../components/students/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/students/Footer'
import Youtube from 'react-youtube'
import { toast } from 'react-toastify'
import axios from 'axios'

function CourseDetails() {
  const { id } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [isAlreadyEnrolled, setisAlreadyEnrolled] = useState(false)
  const [playerData, setplayerData] = useState(null)

  const {
    calculateRating,
    calculateChapterTime,
    currency,
    calculateCourseDuration,
    calculateNoofLectures,
    userData,
    backendURL,
    getToken
  } = useContext(AppContext)

  // Helper function to extract YouTube video ID from various URL formats

  const extractYouTubeId = (url) => {
  if (!url || typeof url !== "string") {
    console.error("Invalid URL:", url);
    return null;
  }

  url = url.trim();

  // Direct video ID case
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  try {
    // youtu.be/VIDEOID
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }

    // youtube.com/watch?v=VIDEOID
    if (url.includes("watch?v=")) {
      return new URL(url).searchParams.get("v");
    }

    // youtube.com/embed/VIDEOID
    if (url.includes("/embed/")) {
      return url.split("/embed/")[1].split("?")[0];
    }

    return null;
  } catch (err) {
    console.error("YouTube ID extract error:", err);
    return null;
  }
};


  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendURL + '/api/course/' + id)
      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const enrolledCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Please login to continue')
      }
      if (isAlreadyEnrolled) {
        return toast.warn('already enrolled')
      }

      const token = await getToken();
      
      if (!courseData?._id) {
        return console.log("courseData._id is missing");
      }

      const { data } = await axios.post(backendURL + '/api/user/purchase', 
        { courseId: courseData._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log("Backend Full Response:", data);

      if (data.success) {
        const { session_url } = data 
        
        if (session_url) {
          window.location.replace(session_url)
        } else {
          toast.error("Stripe URL not found in backend response");
        }
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, [id])

  useEffect(() => {
    if (userData?.enrolledCourses && courseData?._id) {
      setisAlreadyEnrolled(userData.enrolledCourses.map(String).includes(String(courseData._id)));
    }
  }, [userData, courseData, id])

  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handlePreviewClick = (lectureUrl) => {
    console.log("=== Preview Click Debug ===");
    console.log("Raw Lecture URL:", lectureUrl);
    console.log("URL Type:", typeof lectureUrl);
    
    if (!lectureUrl) {
      toast.error('No video URL provided');
      return;
    }
    
    const videoId = extractYouTubeId(lectureUrl);
    console.log("Final Video ID:", videoId);
    
    if (videoId && videoId.length === 11) {
      setplayerData({ videoId });
      toast.success('Loading preview...');
    } else {
      toast.error('Invalid YouTube URL. Please check the video link.');
      console.error("Invalid video ID extracted:", videoId);
    }
  };

  // Handle YouTube player errors
  const onPlayerError = (event) => {
    console.error("YouTube Player Error:", event);
    toast.error('Failed to load video. Please try again.');
    setplayerData(null);
  };

  return courseData ? (
    <>
      <div className="relative min-h-screen">
        <div className="absolute top-0 left-0 w-full h-section-height z-[-1] bg-gradient-to-b from-cyan-100/70 to-white" />
        <div className="flex md:flex-row flex-col-reverse gap-5 relative items-start justify-between md:px-36 px-8 pt-20 md:pt-38 text-left">
          
          <div className="md:w-2/3 w-full max-w-xl text-gray-500 ">
            <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
              {courseData.courseTitle}
            </h1>
            <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }} />
            
            <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
              <p>{calculateRating(courseData)}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img key={i} className="w-3.5 h-3.5" src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="star" />
                ))}
              </div>
              <p>{courseData.enrolledStudents?.length || 0} students</p>
            </div>
            <p className="text-sm">course by <span className="text-blue-600 underline">{courseData.educator?.name}</span></p>

            <div className="pt-8 text-gray-800">
              <h2 className="text-lg font-semibold">Course Structure</h2>
              <div className="pt-5">
                {courseData.courseContent?.map((chapter, index) => (
                  <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                    <div onClick={() => toggleSection(index)} className="flex items-center justify-between px-4 py-3 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <img src={assets.down_arrow_icon} className={`transition-transform ${openSections[index] ? 'rotate-180' : ''}`} alt="" />
                        <p className="font-medium">{chapter.chapterTitle}</p>
                      </div>
                      <p className="text-sm">{chapter.chapterContent?.length} lectures· {calculateChapterTime(chapter)}</p>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                      <ul className="border-t border-gray-300 px-4 py-2">
                        {chapter.chapterContent?.map((lecture, i) => (
                          <li key={i} className="flex justify-between items-center py-1">
                            <div className="flex items-center gap-2">
                              <img src={assets.play_icon} className="w-4 h-4" alt="" />
                              <p>{lecture.lectureTitle}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              {lecture.isPreviewFree && lecture.lectureUrl && (
                                <p 
                                  onClick={() => handlePreviewClick(lecture.lectureUrl)} 
                                  className="text-blue-500 cursor-pointer hover:underline"
                                >
                                  Preview
                                </p>
                              )}
                              <span>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</span>
                              
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                <div className='pt-5 flex flex-col gap-2'>
                  <h1 className='text-lg font-semibold'>course Description</h1>
                  <p className='pt-2 text-gray-600 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
                </div>
          </div>

          <div className="md:w-1/3 w-full course-card z-10 custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
            {playerData ? (
              <Youtube 
                videoId={playerData.videoId} 
                opts={{ 
                  playerVars: { 
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0
                  } 
                }} 
                iframeClassName='w-full aspect-video'
                onError={onPlayerError}
              />
            ) : (
              <img className=" md:w-full shadow-lg" src={courseData.courseThumbnail} alt="course" />
            )}
            <div className="pt-5 flex items-center gap-2 ml-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="" />
              <p className="text-red-500 text-sm"><span className="font-medium">5 days</span> left at this price!</p>
            </div>
            <div className='flex gap-3 items-center pt-2 ml-2'>
              <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}</p>
              <p className='md:text-lg text-gray-500 line-through '>{currency}{courseData.coursePrice}</p>
              <p className='md:text-lg text-gray-500'>{courseData.discount}% off</p>
            </div>
            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1 ml-2'><img src={assets.star} alt="star" /><p>{calculateRating(courseData)}</p></div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'><img src={assets.time_clock_icon} alt="clock" /><p>{calculateCourseDuration(courseData)}</p></div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'><img src={assets.lesson_icon} alt="lesson" /><p>{calculateNoofLectures(courseData)} lessons</p></div>
            </div>
            <button onClick={enrolledCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>{isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}</button>
            <div className='pt-6 ml-2'>
              <p className='md:text-lg text-lg font-medium text-gray-800'>What's in the course?</p>
              <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
                <li>LifeTime access with free updates</li>
                <li>Step-by-step guidance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails