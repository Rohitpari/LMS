import React, { useContext, useEffect, useState } from 'react'
import { dummyStudentEnrolled } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/students/Loading'
import { toast } from 'react-toastify';
import axios from 'axios';

function StudentEnrolled() {
  const { backendURL, getToken, isEducator } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendURL + '/api/educator/enrolled-students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        console.log("Enrolled Students Data:", data);
        // Safely check if array exists before reversing
        if (Array.isArray(data.enrolledStudents)) {
          setEnrolledStudents(data.enrolledStudents.reverse());
        } else {
          setEnrolledStudents([]);
        }
      } else {
        toast.error(data.message);
        setEnrolledStudents([]); // Prevent infinite loading if success is false
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error.message);
      setEnrolledStudents([]); // Prevent infinite loading on network error
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchEnrolledStudents();
    }
  }, [isEducator]);

  // If still fetching data, show Loading
  if (enrolledStudents === null) {
    return <Loading />;
  }

  return (
    <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
        <table className='table-fixed md:table-auto w-full overflow-hidden pb-4 '>
          <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
            <tr>
              <th className='px-4 py-3 font-semibold '>#</th>
              <th className='px-4 py-3 font-semibold '>Student Name</th>
              <th className='px-4 py-3 font-semibold '>Course Title</th>
              <th className='px-4 py-3 font-semibold hidden sm:table-cell'>Date</th>
            </tr>
          </thead>

          <tbody className='text-sm text-gray-500'>
            {enrolledStudents.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-400">
                  No students enrolled yet.
                </td>
              </tr>
            ) : (
              enrolledStudents.map((item, index) => (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>
                    {index + 1}
                  </td>

                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    {/* Fallback image handle if student profile is empty */}
                    <img 
                      src={item.student?.imageUrl || 'https://placehold.co/100'} 
                      alt="Profile"
                      className='w-9 h-9 rounded-full object-cover'
                      onError={(e) => { e.target.src = 'https://placehold.co/100'; }}
                    />
                    <span className='truncate'>{item.student?.name || "Unknown Student"}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle || "N/A"}</td>

                  {/* Safe Date Rendering using optional chaining and structural checking */}
                  <td className='px-4 py-3 hidden sm:table-cell'>
                    {item.purchaseDate || item.purchaseData 
                      ? new Date(item.purchaseDate || item.purchaseData).toLocaleDateString() 
                      : "N/A"
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentEnrolled;