import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Loader from '../../components/Loader';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({ totalConsultations: 0, totalPatients: 0 });
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/doctor/dashboard');
        setStats(response.data.stats);
        setRecentConsultations(response.data.recentConsultations);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!searchIdentifier) return;
    try {
        const response = await api.get(`/doctor/patients?identifier=${searchIdentifier}`);
        setSearchResult(response.data);
    } catch(err) {
        setSearchError(err.response?.data?.message || 'Error finding patient.');
    }
  };

  const startNewConsultation = () => {
      navigate('/doctor/consultation/new', { state: { patient: searchResult } });
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalPatients}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Consultations</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalConsultations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Search */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Find a Patient</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
              <input type="text" value={searchIdentifier} onChange={(e) => setSearchIdentifier(e.target.value)} placeholder="Enter Patient's ABHA Number" className="flex-grow p-2 border border-gray-300 rounded-md" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
          </form>
          {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
          {searchResult && (
              <div className="mt-4 p-4 border border-green-300 bg-green-50 rounded-md flex justify-between items-center">
                  <div>
                      <p className="font-semibold">{searchResult.name}</p>
                      <p className="text-sm text-gray-600">ABHA: {searchResult.abhaNumber}</p>
                  </div>
                  <button onClick={startNewConsultation} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Start Consultation</button>
              </div>
          )}
      </div>

      {/* Recent Consultations */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {recentConsultations.map((consultation) => (
              <li key={consultation.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{consultation.patientName}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{new Date(consultation.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">{consultation.summary}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;