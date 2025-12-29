import react from 'react'
import { Route, Routes ,useMatch } from 'react-router-dom'
// import Home from './pages/student/Home '  
import Player from './pages/student/Player'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import MyEnrollments from './pages/student/MyEnrollments.jsx'
// import CourseDetails from './pages/student/CourseDetails.jsx'
import Loading from './components/students/Loading.jsx'
import Educator from './pages/educator/Educator.jsx'
import DashBoard from './pages/educator/Dashboard.jsx'
import AddCourse from './pages/educator/AddCourse.jsx'
import MyCourses from './pages/educator/MyCourses.jsx'
import StudentEnrolled from './pages/educator/StudentEnrolled.jsx'
import Navbar from './components/students/Navbar.jsx'
import CourseDetails from './pages/student/CourseDetails.jsx'
import "quill/dist/quill.snow.css";


function App() { 

  const isEducatorRoute = useMatch('/educator/*')
  return (

    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar/>}
      <Routes>

        <Route path="/" element={<Home/>} />
        <Route path="/course-list" element={<CoursesList/>} />
        <Route path="/course-list/:input" element={<CoursesList/>} />
        <Route path="/course/:id" element={<CourseDetails/>} />
        <Route path="/my-enrollments" element={<MyEnrollments/>} />
        <Route path="/player/:courseId" element={<Player/>} />
        <Route path="/loading/:path" element={<Loading/>} />
        <Route path='/educator' element={<Educator/>}>
          <Route path='/educator' element={<DashBoard />}/>
          <Route path='add-course' element={<AddCourse />}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='student-enrolled' element={<StudentEnrolled />}/>
        </Route>


      </Routes>
    
      
      </div>
  )
}

export default App