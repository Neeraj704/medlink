// FILE: client/src/components/consultation/Step3Medication.jsx

import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const Step3Medication = ({ data, setData, onNext, onBack }) => {
    const handleAddMedication = () => {
        setData([...data, { name: '', dosage: '', frequency: '', duration: '' }]);
    };
    
    const handleRemoveMedication = (index) => {
        const list = [...data];
        list.splice(index, 1);
        setData(list);
    };

    const handleMedicationChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...data];
        list[index][name] = value;
        setData(list);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Prescription</h2>
            <div className="space-y-3">
            {data.map((med, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-2 bg-gray-50 rounded-md">
                    <input name="name" value={med.name} onChange={e => handleMedicationChange(e, i)} placeholder="Medicine Name" className="md:col-span-2 p-2 border border-gray-300 rounded-md"/>
                    <input name="dosage" value={med.dosage} onChange={e => handleMedicationChange(e, i)} placeholder="Dosage (e.g., 500mg)" className="p-2 border border-gray-300 rounded-md"/>
                    <input name="frequency" value={med.frequency} onChange={e => handleMedicationChange(e, i)} placeholder="Frequency (e.g., Twice a day)" className="p-2 border border-gray-300 rounded-md"/>
                    <div className="flex items-center">
                        <input name="duration" value={med.duration} onChange={e => handleMedicationChange(e, i)} placeholder="Duration (e.g., 5 days)" className="flex-grow p-2 border border-gray-300 rounded-md"/>
                        <button type="button" onClick={() => handleRemoveMedication(i)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            ))}
            </div>
            <button type="button" onClick={handleAddMedication} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-4">
                <PlusIcon className="h-4 w-4" /> Add Medication
            </button>
            <div className="flex justify-between mt-6">
                <button onClick={onBack} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400">
                    Back
                </button>
                <button onClick={onNext} disabled={data.some(m => !m.name)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    Next
                </button>
            </div>
        </div>
    );
};

export default Step3Medication;