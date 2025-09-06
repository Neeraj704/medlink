// FILE: client/src/components/consultation/DiagnosisAutocomplete.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

const DiagnosisAutocomplete = ({ onSelect, initialValue = '' }) => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        fetch('/query_database.csv')
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => setData(results.data),
                });
            });
    }, []);

    const filterSuggestions = useCallback(() => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        const filtered = data
            .filter(row => row['ICD11_Title']?.toLowerCase().includes(lowerCaseQuery))
            .slice(0, 10);
        setSuggestions(filtered);
        setIsActive(filtered.length > 0);
    }, [query, data]);

    useEffect(() => {
        const handler = setTimeout(() => {
            filterSuggestions();
        }, 300); // Debounce
        return () => clearTimeout(handler);
    }, [query, filterSuggestions]);

    const handleSelect = (item) => {
        const displayName = item['ICD11_Title'];
        const codes = [
            { system: 'ICD-11', code: item['ICD11_Code'], display: displayName },
            { system: 'NAMASTE-Ayurveda', code: item['Ayurveda_NAMC_CODE'], display: displayName },
            { system: 'NAMASTE-Siddha', code: item['Siddha_NAMC_CODE'], display: displayName },
            { system: 'NAMASTE-Unani', code: item['Unani_NUMC_CODE'], display: displayName },
        ].filter(c => c.code && c.code !== 'nan');
        
        onSelect({ name: displayName, codes });
        setQuery(displayName);
        setSuggestions([]);
        setIsActive(false);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsActive(true)}
                onBlur={() => setTimeout(() => setIsActive(false), 200)} // delay to allow click
                placeholder="Type diagnosis to search..."
                className="flex-grow p-2 border border-gray-300 rounded-md w-full"
            />
            {isActive && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                        <li key={idx} onMouseDown={() => handleSelect(item)} className="p-2 hover:bg-gray-100 cursor-pointer">
                            <div className="font-semibold">{item['ICD11_Title']}</div>
                            <div className="text-xs text-gray-500">
                                ICD-11: {item['ICD11_Code']} | Ayurveda: {item['Ayurveda_NAMC_CODE']}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DiagnosisAutocomplete;