import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const { backendUrl, setIsLoggedIn,getUserData } = useContext(AppContent);
  const navigate = useNavigate();

  const [state, setState] = useState('SignUp');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      if (state === 'SignUp') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px:0 bg-gradient-to-br from-blue-200 to purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm-w-32 cursor-pointer'
      />
      <div className='bg-slate-900 p-10 rounded shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'SignUp' ? 'Create Account' : 'Login to Your Account'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'SignUp' ? 'Create Your Account' : 'Login to Your Account'}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === 'SignUp' && (
            <div className='mb-4 flex item-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt="" />
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                className='bg-transparent outline-none'
                type="text"
                placeholder='Full Name'
                required
              />
            </div>
          )}
          <div className='mb-4 flex item-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none'
              type="email"
              placeholder='email'
              required
            />
          </div>
          <div className='mb-4 flex item-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none'
              type="Password"
              placeholder='Password'
              required
            />
          </div>
       
          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>
        {state === 'SignUp' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an Account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-blue-400 cursor-pointer underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an Account?{' '}
            <span
              onClick={() => setState('SignUp')}
              className='text-blue-400 cursor-pointer underline'
            >
              SignUp here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
