import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api';

const PatientLogin = () => {
  const [abhaNumber, setAbhaNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [txId, setTxId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/abha/send-otp', { abhaNumber });
      setTxId(response.data.txId);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check the ABHA number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/abha/verify-otp', { txId, otp });
      login(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img className="mx-auto h-12 w-auto" src="/mainLogo.svg" alt="MedLink Logo" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Patient Login</h2>
          <p className="mt-2 text-sm text-gray-600">Login using your ABHA Number</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="abha" className="sr-only">ABHA Number</label>
              <input id="abha" name="abha" type="text" value={abhaNumber} onChange={(e) => setAbhaNumber(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter your 14-digit ABHA Number" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
             <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input id="otp" name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter 6-digit OTP" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </div>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-500">
            Not a patient?{' '}
            <Link to="/login/doctor" className="font-medium text-blue-600 hover:text-blue-500">
                Login as a Doctor
            </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientLogin;