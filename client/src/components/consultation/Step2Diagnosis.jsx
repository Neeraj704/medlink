// FILE: client/src/components/consultation/Step2Diagnosis.jsx

import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import DiagnosisAutocomplete from './DiagnosisAutocomplete';

const Step2Diagnosis = ({ data, setData, onNext, onBack }) => {
    const handleAddDiagnosis = () => {
        setData([...data, { name: '', codes: [] }]);
    };

    const handleRemoveDiagnosis = (index) => {
        const list = [...data];
        list.splice(index, 1);
        setData(list);
    };

    const handleSelectDiagnosis = (selected, index) => {
        const list = [...data];
        list[index] = selected;
        setData(list);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Diagnosis</h2>
            <div className="space-y-3">
                {data.map((dx, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <div className="flex-grow">
                            <DiagnosisAutocomplete 
                                onSelect={(selected) => handleSelectDiagnosis(selected, i)} 
                                initialValue={dx.name}
                            />
                        </div>
                        <button type="button" onClick={() => handleRemoveDiagnosis(i)} className="p-2 text-red-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAddDiagnosis} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-4">
                <PlusIcon className="h-4 w-4" /> Add Diagnosis
            </button>
            <div className="flex justify-between mt-6">
                <button onClick={onBack} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400">
                    Back
                </button>
                <button onClick={onNext} disabled={data.some(d => !d.name)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    Next
                </button>
            </div>
        </div>
    );
};

export default Step2Diagnosis;