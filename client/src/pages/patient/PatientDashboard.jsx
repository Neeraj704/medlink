// FILE: client/src/pages/patient/PatientDashboard.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api';
import Loader from '../../components/Loader';
import { XMarkIcon } from '@heroicons/react/24/solid';

const PatientDashboard = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await api.get('/patient/records');
        setConsultations(response.data.data);
      } catch (err) {
        setError('Failed to fetch consultation records.');
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  const viewDetails = async (id) => {
    try {
        const response = await api.get(`/patient/records/${id}`);
        setSelectedConsultation(response.data);
    } catch(err) {
        setError('Could not fetch consultation details.');
    }
  };
  
  const downloadPdf = async (id) => {
    try {
        const response = await api.get(`/patient/records/${id}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `consultation-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (err) {
        setError('Failed to download PDF.');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all your consultations recorded on MedLink.</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diagnosis Summary</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {consultations.length > 0 ? (
                    consultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{new Date(consultation.date).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{consultation.doctorName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{consultation.summary}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => viewDetails(consultation.id)} className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                        <button onClick={() => downloadPdf(consultation.id)} className="text-indigo-600 hover:text-indigo-900">Download PDF</button>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr><td colSpan="4" className="text-center py-4 text-gray-500">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {selectedConsultation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3 text-left">
                    <div className="flex justify-between items-center pb-3 border-b">
                        <h3 className="text-xl leading-6 font-medium text-gray-900">Consultation Details</h3>
                        <button onClick={() => setSelectedConsultation(null)} className="p-1 rounded-full hover:bg-gray-200">
                           <XMarkIcon className="h-6 w-6 text-gray-600"/>
                        </button>
                    </div>
                    <div className="mt-4 space-y-4">
                        <div><strong>Date:</strong> {new Date(selectedConsultation.date).toLocaleString()}</div>
                        <div><strong>Doctor:</strong> Dr. {selectedConsultation.doctor.user.name}</div>
                        
                        {selectedConsultation.vitals && Object.keys(selectedConsultation.vitals).length > 0 && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-gray-800">Vitals</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                {Object.entries(selectedConsultation.vitals).map(([key, value]) => value && <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>)}
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-800">Diagnoses:</h4>
                            <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                {selectedConsultation.diagnoses.map((d, i) => <li key={i}>{d.name}</li>)}
                            </ul>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-800">Medications:</h4>
                            <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                {selectedConsultation.medications.map((m, i) => <li key={i}>{m.name} - {m.dosage}, {m.frequency}, for {m.duration}</li>)}
                            </ul>
                        </div>
                         {selectedConsultation.notes && <div className="mt-4"><h4 className="font-semibold text-gray-800">Notes:</h4><p className="text-sm text-gray-600">{selectedConsultation.notes}</p></div>}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;