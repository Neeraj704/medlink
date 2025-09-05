import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import api from '../../api';

const NewConsultation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [diagnoses, setDiagnoses] = useState([{ name: '', codes: [] }]);
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (location.state?.patient) {
      setPatient(location.state.patient);
    } else {
      // Redirect if no patient data is passed
      navigate('/doctor/dashboard');
    }
  }, [location, navigate]);
  
  // Debounced search for terminology
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
        api.get(`/terminology/search?q=${searchTerm}`)
            .then(response => setSuggestions(response.data))
            .catch(err => console.error("Search failed", err));
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleAddDiagnosis = () => {
    setDiagnoses([...diagnoses, { name: '', codes: [] }]);
  };
  const handleRemoveDiagnosis = (index) => {
    const list = [...diagnoses];
    list.splice(index, 1);
    setDiagnoses(list);
  };
  const handleDiagnosisChange = (e, index) => {
    const { value } = e.target;
    const list = [...diagnoses];
    list[index].name = value;
    setDiagnoses(list);
    setSearchTerm(value);
  };
  const selectSuggestion = (suggestion, index) => {
      const list = [...diagnoses];
      list[index] = { name: suggestion.displayName, codes: suggestion.codes };
      setDiagnoses(list);
      setSearchTerm('');
      setSuggestions([]);
  }

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };
  const handleRemoveMedication = (index) => {
    const list = [...medications];
    list.splice(index, 1);
    setMedications(list);
  };
  const handleMedicationChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...medications];
    list[index][name] = value;
    setMedications(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const consultationData = {
        patientIdentifier: patient.abhaNumber,
        diagnoses,
        medications,
        notes
    };
    try {
        await api.post('/doctor/consultation', consultationData);
        setSuccess('Consultation saved successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/doctor/dashboard'), 2000);
    } catch(err) {
        setError(err.response?.data?.message || 'Failed to save consultation.');
    } finally {
        setLoading(false);
    }
  };

  if (!patient) return <p>Loading patient data...</p>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">New Consultation</h1>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="font-semibold text-lg">{patient.name}</h2>
        <p className="text-sm text-gray-600">ABHA: {patient.abhaNumber}</p>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Diagnoses Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Diagnosis</h3>
          {diagnoses.map((dx, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 relative">
              <input type="text" value={dx.name} onChange={(e) => handleDiagnosisChange(e, i)} placeholder="Type diagnosis..." className="flex-grow p-2 border border-gray-300 rounded-md" />
              <button type="button" onClick={() => handleRemoveDiagnosis(i)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
              {searchTerm && dx.name === searchTerm && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                        <li key={idx} onClick={() => selectSuggestion(s, i)} className="p-2 hover:bg-gray-100 cursor-pointer">
                            {s.displayName}
                        </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddDiagnosis} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><PlusIcon className="h-4 w-4"/> Add Diagnosis</button>
        </div>

        {/* Medications Section */}
        <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Medication</h3>
            {medications.map((med, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 items-center">
                    <input name="name" value={med.name} onChange={e => handleMedicationChange(e, i)} placeholder="Medicine Name" className="md:col-span-2 p-2 border border-gray-300 rounded-md"/>
                    <input name="dosage" value={med.dosage} onChange={e => handleMedicationChange(e, i)} placeholder="Dosage (e.g., 500mg)" className="p-2 border border-gray-300 rounded-md"/>
                    <input name="frequency" value={med.frequency} onChange={e => handleMedicationChange(e, i)} placeholder="Frequency (e.g., Twice a day)" className="p-2 border border-gray-300 rounded-md"/>
                    <div className="flex items-center">
                        <input name="duration" value={med.duration} onChange={e => handleMedicationChange(e, i)} placeholder="Duration (e.g., 5 days)" className="flex-grow p-2 border border-gray-300 rounded-md"/>
                        <button type="button" onClick={() => handleRemoveMedication(i)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            ))}
             <button type="button" onClick={handleAddMedication} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><PlusIcon className="h-4 w-4"/> Add Medication</button>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="4" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                {loading ? 'Saving...' : 'Save and Finalize'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewConsultation;