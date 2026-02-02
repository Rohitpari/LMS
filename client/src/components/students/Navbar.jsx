import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

function Navbar() {



  // const { navigate } = useContext(AppContext);
  const { isEducator, navigate, backendURL, setIsEducator, getToken } = useContext(AppContext);
  const isCoursesListpage = location.pathname.includes('/courses-list');

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const BecomeEducator = async()=>{
    try {
      if(isEducator){
        navigate('/educator');
        return;
      }
      const token = await getToken();
      const {data} = await axios.post(backendURL + '/api/user/update-role',
        {headers:{ Authorization: `Bearer ${token}` }})
        if(data?.success){
          setIsEducator(true);
          toast.success(data.message);

        }else{
          toast.error(data.message);
        }

    } catch (error) {
      toast.error(error.message);
    }
  }

  

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCoursesListpage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer' />

      <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5'>


          {user &&
            <>
              <button onClick={BecomeEducator}>{isEducator ?  'Educator Dashboard' : 'Become Educator'}</button>
              <Link to={'/my-enrollments'}>My Enrollments</Link>
            </>
          }

        </div>
        {user ? <UserButton /> : <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-blue-700 transition'
        >Create Account</button>}

      </div>
      {/* forphone view */}
      <div className='md:hidden '>
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500 '>
          <div className='flex items-center gap-1 max:gap-2 max:sm:text-xs'>

            {user && <><button onClick={BecomeEducator}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>

              <Link to={'/my-enrollments'}>My Enrollments</Link>
            </>}
          </div>

          {user ? <UserButton /> : <button onClick={() => openSignIn()}><img src={assets.user_icon} alt="" /></button>}
        </div>
      </div>
    </div>
  )
}

export default Navbar