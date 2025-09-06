import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Loader from '../../components/Loader';
import { DocumentPlusIcon, MagnifyingGlassIcon, UserGroupIcon, ClipboardDocumentListIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DoctorDashboard = () => {
    const [stats, setStats] = useState({ totalConsultations: 0, totalPatients: 0 });
    const [recentConsultations, setRecentConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchIdentifier, setSearchIdentifier] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const navigate = useNavigate();

    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

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
        if (!searchIdentifier) {
            setSearchError('Please enter an ABHA number to search.');
            return;
        };
        setSearchLoading(true);
        try {
            const response = await api.get(`/doctor/patients?identifier=${searchIdentifier}`);
            setSearchResult(response.data);
        } catch (err) {
            setSearchError(err.response?.data?.message || 'Error finding patient. Please check the ABHA number and try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    const startNewConsultation = (patientData) => {
        navigate('/doctor/consultation/new', { state: { patient: patientData } });
    };

    const viewConsultationDetails = async (id) => {
        setModalLoading(true);
        try {
            const response = await api.get(`/doctor/consultation/${id}`);
            setSelectedConsultation(response.data);
        } catch (err) {
            setError('Could not fetch consultation details.');
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full"><UserGroupIcon className="h-6 w-6 text-blue-600" /></div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Unique Patients</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalPatients}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full"><ClipboardDocumentListIcon className="h-6 w-6 text-green-600" /></div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Consultations</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalConsultations}</dd>
                    </div>
                </div>
            </div>

            {/* Guided Consultation Workflow */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Start a New Consultation</h2>
                <p className="text-sm text-gray-600 mb-4">Follow the steps below to create a new patient record.</p>
                <div className="p-4 border-dashed border-2 border-gray-300 rounded-lg">
                    <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="font-bold text-blue-600">Step 1:</span> Find Patient
                    </label>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 transform -translate-y-1/2"/>
                            <input id="patientSearch" type="text" value={searchIdentifier} onChange={(e) => setSearchIdentifier(e.target.value)} placeholder="Enter Patient's 14-digit ABHA Number" className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <button type="submit" disabled={searchLoading} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-300">
                            {searchLoading ? 'Searching...' : <><MagnifyingGlassIcon className="h-5 w-5"/> Find Patient</>}
                        </button>
                    </form>
                    {searchError && <p className="text-red-500 mt-2 text-sm">{searchError}</p>}
                </div>
                {searchResult && (
                    <div className="mt-4 p-4 border-dashed border-2 border-green-400 bg-green-50 rounded-lg">
                        <p className="block text-sm font-medium text-gray-700 mb-2"><span className="font-bold text-green-600">Step 2:</span> Patient Found</p>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-2 sm:mb-0">
                                <p className="font-semibold text-gray-800">{searchResult.name}</p>
                                <p className="text-sm text-gray-600">ABHA: {searchResult.abhaNumber}</p>
                            </div>
                            <button onClick={() => startNewConsultation(searchResult)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 w-full sm:w-auto justify-center">
                                <DocumentPlusIcon className="h-5 w-5"/> Start Consultation for this Patient
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Consultations */}
            <div className="mt-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white shadow-sm overflow-hidden rounded-lg">
                    <ul role="list" className="divide-y divide-gray-200">
                        {recentConsultations.length > 0 ? recentConsultations.map((c) => (
                            <li key={c.id} onClick={() => viewConsultationDetails(c.id)} className="cursor-pointer hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">{c.patientName}</p>
                                        <div className="ml-2 flex-shrink-0 flex"><p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{new Date(c.date).toLocaleDateString()}</p></div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between"><div className="sm:flex"><p className="flex items-center text-sm text-gray-700">{c.summary}</p></div></div>
                                </div>
                            </li>
                        )) : ( <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent activity.</li> )}
                    </ul>
                </div>
            </div>

            {/* MODAL for Consultation Details */}
            {selectedConsultation && (
                // Changed background to blurred white for a softer look
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        {modalLoading ? <Loader /> : (
                            <div>
                                <div className="flex justify-between items-center pb-3 border-b">
                                    <h3 className="text-xl leading-6 font-medium text-gray-900">Consultation Details</h3>
                                    <button onClick={() => setSelectedConsultation(null)} className="p-1 rounded-full hover:bg-gray-200">
                                        <XMarkIcon className="h-6 w-6 text-gray-600"/>
                                    </button>
                                </div>
                                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto p-2">
                                    <p><strong>Patient:</strong> {selectedConsultation.patient.user.name}</p>
                                    <p><strong>Date:</strong> {new Date(selectedConsultation.date).toLocaleString()}</p>
                                    
                                    {selectedConsultation.vitals && Object.keys(selectedConsultation.vitals).length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Vitals</h4>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                                {Object.entries(selectedConsultation.vitals).map(([key, value]) => value && <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>)}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold text-gray-800">Diagnoses:</h4>
                                        <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                            {selectedConsultation.diagnoses.map((d, i) => <li key={i}>{d.name}</li>)}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-800">Medications:</h4>
                                        <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                            {selectedConsultation.medications.map((m, i) => <li key={i}>{m.name} - {m.dosage}, {m.frequency}, for {m.duration}</li>)}
                                        </ul>
                                    </div>
                                    
                                    {selectedConsultation.notes && <div><h4 className="font-semibold text-gray-800">Notes:</h4><p className="text-sm text-gray-600">{selectedConsultation.notes}</p></div>}
                                </div>
                                 <div className="mt-4 text-right">
                                    <button onClick={() => setSelectedConsultation(null)} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600">Close</button>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;