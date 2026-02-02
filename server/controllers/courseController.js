
import Course from '../models/Course.js'


// get all Courses
export const getAllCourse = async(req,res)=>{
    try {
        const courses = await Course.find({isPublished : true})
        .select(['-courseContent','-enrolledStudent']).populate({path : 'educator'})
         res.json({success:true,courses})
    } catch (error) {
        console.log('this side from getAllcourse');
        res.json({success : false,message : error.message})
    }
}


// get Course by id


export const getCourseId = async(req,res)=>{
    const {id} = req.params

    if (!id) {
      return res.json({ success: false, message: "Course ID missing" });
    }
    // console.log("id" , id);

    try {
        const courseData = await Course.findById(id).populate({path:'educator'})
        // remove lectureUrl if isPreviewFree  is false
        courseData.courseContent.forEach(chapter =>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })
        res.json({success:true,courseData})

    } catch (error) {
     console.log("this side from getCourseId");
     res.json({success : false,message : error.message})   
    }
}


 
