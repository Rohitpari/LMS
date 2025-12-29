import React, { use, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/students/Footer';
import Rating from '../../components/students/Rating';
function Player() {
  const {enrolledCourses,calculateChapterTime} = useContext(AppContext);
  const {courseId} = useParams()
  const [courseData,setCourseData] = useState(null)
  const [openSections,setOpenSections] = useState({})
  const [playerData,setplayerData] = useState(null)

  const getcourseData=()=>{
    enrolledCourses.map((course)=>{
      if(course._id===courseId){
        setCourseData(course)
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }
  useEffect(()=>{
    getcourseData();
  },[enrolledCourses])

  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        {/* left column */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>

          <div className="pt-5">
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white mb-2 rounded"
              >
                <div
                  onClick={() => toggleSection(index)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      className={`transition-transform ${openSections[index] ? 'rotate-180' : ''
                        }`}
                      alt=""
                    />
                    <p className="font-medium">
                      {chapter.chapterTitle}
                    </p>
                  </div>

                  <p className="text-sm">
                    {chapter.chapterContent.length} lectures·{' '}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <ul className="border-t border-gray-300 px-4 py-2">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-1"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={false ? assets.blue_tick_icon : assets.play_icon}
                            className="w-4 h-4"
                            alt=""
                          />
                          <p>{lecture.lectureTitle}</p>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          {lecture.lectureUrl && (
                            <p onClick={() => setplayerData({
                              ... lecture,chapter:index+1, lecture:i+1
                            })}
                              className="text-blue-500 cursor-pointer">
                              watch
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
            <Rating initialRating={0}/>
          </div>
        </div>

        {/* right column */}
        <div>
          {playerData ? (
            <div className='md:mt-10'>
              <YouTube videoId={playerData.lectureUrl.split('/').pop()}  iframeClassName='w-full aspect-video'/>
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button  className='text-blue-600'>{false ? 'complete' : 'Mark as complete'}</button>
              </div>
            </div>
          ) : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />}
         
        </div>
      </div>

      <Footer/>
    </>

  )
}

export default Player