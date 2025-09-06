// FILE: client/src/components/consultation/Step1PatientVitals.jsx

import React from 'react';

const Step1PatientVitals = ({ data, setData, onNext }) => {
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Vitals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input type="text" name="height" id="height" value={data.height || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input type="text" name="weight" id="weight" value={data.weight || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">Blood Pressure (e.g., 120/80)</label>
                    <input type="text" name="bloodPressure" id="bloodPressure" value={data.bloodPressure || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                    <input type="text" name="temperature" id="temperature" value={data.temperature || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">Pulse (bpm)</label>
                    <input type="text" name="pulse" id="pulse" value={data.pulse || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
             <div className="flex justify-end mt-6">
                <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Next
                </button>
            </div>
        </div>
    );
};

export default Step1PatientVitals;