// FILE: client/src/components/consultation/Step4Review.jsx

import React from 'react';

const Step4Review = ({ consultationData, setNotes, onBack, onSubmit, loading }) => {
    const { vitals, diagnoses, medications, notes } = consultationData;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Review and Finalize</h2>
            
            {/* Vitals Review */}
            <div className="mb-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg mb-2">Vitals</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(vitals).map(([key, value]) => value && <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>)}
                </div>
            </div>

            {/* Diagnosis Review */}
            <div className="mb-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg mb-2">Diagnoses</h3>
                <ul className="list-disc list-inside">
                    {diagnoses.map((dx, i) => <li key={i}>{dx.name}</li>)}
                </ul>
            </div>

            {/* Medication Review */}
            <div className="mb-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg mb-2">Medications</h3>
                <ul className="list-disc list-inside">
                    {medications.map((med, i) => <li key={i}>{`${med.name} - ${med.dosage}, ${med.frequency}, for ${med.duration}`}</li>)}
                </ul>
            </div>

            {/* Notes Section */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea name="notes" id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>

            <div className="flex justify-between mt-6">
                <button onClick={onBack} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400">
                    Back
                </button>
                <button onClick={onSubmit} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300">
                    {loading ? 'Saving...' : 'Save and Finalize'}
                </button>
            </div>
        </div>
    );
};

export default Step4Review;