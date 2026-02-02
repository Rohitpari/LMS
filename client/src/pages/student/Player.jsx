import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';  
import Footer from '../../components/students/Footer';
import Rating from '../../components/students/Rating';
import { toast } from 'react-toastify';
import Loading from '../../components/students/Loading';
import axios from 'axios';

function Player() {

  const { 
    enrolledCourses, 
    calculateChapterTime, 
    backendURL, 
    getToken, 
    userData,
    fetchUserEnrolledCourese
  } = useContext(AppContext);

  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setplayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  /* ================================
     YouTube ID Extractor (FIX)
  ================================= */
  const extractYouTubeId = (url) => {
    if (!url || typeof url !== "string") return null;

    url = url.trim();

    // direct id
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

    // youtu.be
    let match = url.match(/youtu\.be\/([^?&]+)/);
    if (match && match[1]) return match[1];

    // watch?v=
    match = url.match(/v=([^?&]+)/);
    if (match && match[1]) return match[1];

    // embed
    match = url.match(/embed\/([^?&]+)/);
    if (match && match[1]) return match[1];

    return null;
  };

  /* ================================
     Get Course Data
  ================================= */
  const getcourseData = () => {
    enrolledCourses.forEach((course) => {
      if (String(course._id) === String(courseId)) {
        setCourseData(course);

        course.courseRating?.forEach((item) => {
          if (String(item.userId) === String(userData?._id)) {
            setInitialRating(item.rating)
          }
        })
      }
    })
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getcourseData();
    }
  }, [enrolledCourses])

  /* ================================
     UI Controls
  ================================= */
  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  /* ================================
     Mark Lecture Complete
  ================================= */
  const markLectureComplete = async (lectureId) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        `${backendURL}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getCourseProgress();
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  /* ================================
     Get Course Progress
  ================================= */
  const getCourseProgress = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        `${backendURL}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) { 
      toast.error(error.message); 
    }
  }

  useEffect(() => {
    getCourseProgress();
  }, [])

  /* ================================
     Rating
  ================================= */
  const handleRate = async (rating)=>{
    try {
      const token = await getToken();

      const { data } = await axios.post(
        `${backendURL}/api/user/add-rating`,
        { courseId, rating},
        { headers: { Authorization: `Bearer ${token}` } }
      )  

      if(data.success){
        toast.success(data.message);
        fetchUserEnrolledCourese();
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  /* ================================
     UI
  ================================= */
  return courseData ?  (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        
        {/* LEFT */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>

          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                
                <div
                  onClick={() => toggleSection(index)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      className={`transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                      alt=""
                    />
                    <p className="font-medium">{chapter.chapterTitle}</p>
                  </div>

                  <p className="text-sm">
                    {chapter.chapterContent.length} lectures · {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className="border-t border-gray-300 px-4 py-2">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex justify-between items-center py-1">
                        
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              progressData?.lectureCompleted?.includes(lecture.lectureId)
                              ? assets.blue_tick_icon 
                              : assets.play_icon
                            }
                            className="w-4 h-4"
                            alt=""
                          />
                          <p>{lecture.lectureTitle}</p>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          {lecture.lectureUrl && (
                            <p 
                              onClick={() => setplayerData({
                                ...lecture, 
                                chapter: index + 1, 
                                lecture: i + 1
                              })}
                              className="text-blue-500 cursor-pointer hover:underline"
                            >
                              Watch
                            </p>
                          )}
                          <span>
                            {humanizeDuration(
                              lecture.lectureDuration * 60 * 1000,
                              { units: ['h', 'm'] }
                            )}
                          </span>
                        </div>

                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this Course</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {playerData ? (
            <div className='md:mt-10'>
              
              <YouTube 
                videoId={extractYouTubeId(playerData.lectureUrl)} 
                iframeClassName='w-full aspect-video'
                opts={{
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0
                  }
                }}
                onError={(e)=>{
                  console.error("YouTube Error:", e);
                  toast.error("Video load failed");
                }}
              />

              <div className='flex justify-between items-center mt-1'>
                <p>
                  {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                </p>

                <button 
                  onClick={()=>markLectureComplete(playerData.lectureId)}
                  className='text-blue-600'
                >
                  {progressData?.lectureCompleted?.includes(playerData.lectureId)
                    ? 'Completed'
                    : 'Mark as complete'
                  }
                </button>
              </div>

            </div>
          ) : (
            <img src={courseData.courseThumbnail} alt="course" />
          )}
        </div>

      </div>

      <Footer />
    </>
  ) : <Loading/>
}

export default Player
