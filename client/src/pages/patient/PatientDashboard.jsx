import React, { useState, useEffect } from 'react';
import api from '../../api';
import Loader from '../../components/Loader';

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
        const response = await api.get(`/patient/records/${id}/pdf`, {
            responseType: 'blob', // Important for file downloads
        });
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
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">My Medical Records</h1>
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
                    <tr><td colSpan="4" className="text-center py-4">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {selectedConsultation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Consultation Details</h3>
                    <div className="mt-2 py-3">
                        <p><strong>Date:</strong> {new Date(selectedConsultation.date).toLocaleString()}</p>
                        <p><strong>Doctor:</strong> {selectedConsultation.doctor.user.name}</p>
                        <div className="mt-4">
                            <h4 className="font-semibold">Diagnoses:</h4>
                            <ul className="list-disc list-inside">
                                {selectedConsultation.diagnoses.map((d, i) => <li key={i}>{d.name}</li>)}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Medications:</h4>
                             <ul className="list-disc list-inside">
                                {selectedConsultation.medications.map((m, i) => <li key={i}>{m.name} - {m.dosage}, {m.frequency}, for {m.duration}</li>)}
                            </ul>
                        </div>
                         {selectedConsultation.notes && <div className="mt-4"><h4 className="font-semibold">Notes:</h4><p>{selectedConsultation.notes}</p></div>}
                    </div>
                    <div className="items-center px-4 py-3">
                        <button onClick={() => setSelectedConsultation(null)} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;