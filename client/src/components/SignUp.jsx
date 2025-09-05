import React, { useState } from 'react'
import MainLogo from './MainLogo'
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [aadharId, setAadharId] = useState("")
    const [otp, setOTP] = useState(null)
    const [otpClicked, setOtpClciked] = useState(false)
    // for navigation
    const navigate = useNavigate();

    // simple redirecting to signup page
    const rerouteToSignIn = () => {
        navigate('/login');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // fetch aadhar and otp from here

        setAadharId('');
        setOTP('');
    }

  return (
    <div className='w-full h-screen bg-neutral-200 '>
            <div className='flex justify-center items-center h-full w-full'>
                <div className='w-128 h-128 bg-neutral-50 rounded-xl shadow-2xl p-10'>
                    {/* heading logo */}
                    <div className='flex w-full justify-center items-center'>
                        <MainLogo />
                    </div>

                    {/* heading message (can change this) */}
                    <div className='w-full flex justify-start pt-8 text-2xl font-semibold text-neutral-700'>
                        Login With
                    </div>

                    {/* the buttons for switching states */}
                    <div className='pt-2 flex justify-between items-center gap-1'>
                        <div className='w-1/2 flex justify-center text-xl border-sky-600
                                    py-3 text-neutral-600 rounded-md border-2 hover:border-sky-700
                                    hover:bg-sky-700 hover:text-white cursor-pointer' onClick={rerouteToSignIn}>
                            ABHA ID
                        </div>
                        <div className='w-1/2 flex justify-center text-xl border-2 bg-sky-600 border-sky-600 py-3
                                    rounded-md hover:bg-sky-700 hover:border-sky-700 cursor-pointer
                                  text-white'>
                            AADHAR ID
                        </div>
                    </div>

                    {/* form starts here */}
                    <form action="#" method="post" className='pt-5 flex flex-col'>
                        {/* aadhar id input field */}
                        <input type="text" placeholder="Enter AADHAR ID"
                            className="flex-1 px-4 py-3 outline-none text-neutral-600
                            border-1 border-neutral-300 rounded-md" value={aadharId} 
                            onChange={(e) => {setAadharId(e.target.value);}}
                        />

                        <div className="flex items-center justify-between border-1 border-neutral-300 rounded-md p-2 mt-3">
                            {/* otp input field */}
                            <input type="text" placeholder="Enter OTP"
                                className="flex-1 px-2 py-1 outline-none text-neutral-600 focus:border-neutral-400" 
                                value={otp} onChange={(e) => {setOTP(e.target.value);}}/>

                            {/* send otp button idhar */}
                            <div
                                type="submit" className="ml-2 text-neutral-500 text-sm font-semibold hover:text-neutral-600 cursor-pointer" onClick={() => {setOtpClciked(true);}}>
                                { otpClicked ? <div className='cursor-pointer' >Resend OTP</div> : <div>SEND OTP </div>}
                            </div>
                        </div>

                        {/* login button */}
                        <button className='w-full bg-sky-600 py-3 px-5 mt-3 text-xl rounded-md text-white
                            hover:bg-sky-700 cursor-pointer' onClick={handleSubmit}>
                            Sign Up</button>
                    </form>

                    {/* ending message */}
                    <div className='w-full text-center pt-5'>
                       Already Have an Abha ID? <span className='text-blue-600 
                        hover:text-blue-700 cursor-pointer' onClick={rerouteToSignIn}>Login</span>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default SignUp