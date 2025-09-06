import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import CsvFile from '../../assets/query_database.csv';

const DiagnosisAutocomplete = ({ onSelect, initialValue = '' }) => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        Papa.parse(CsvFile, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const cleanData = results.data.map(row => {
                    delete row[""]; 
                    return row;
                });
                setData(cleanData);
            },
            error: (err) => {
                console.error("Error parsing CSV file:", err);
            }
        });
    }, []);

    const filterSuggestions = useCallback(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        
        const filtered = data.filter(row => 
            row['ICD11_Title']?.toLowerCase().includes(lowerCaseQuery) ||
            row['Ayurveda_NAMC_CODE']?.toLowerCase().includes(lowerCaseQuery) ||
            row['Siddha_NAMC_CODE']?.toLowerCase().includes(lowerCaseQuery) ||
            row['Unani_NUMC_CODE']?.toLowerCase().includes(lowerCaseQuery)
        ).slice(0, 10);
        
        setSuggestions(filtered);
        setIsActive(filtered.length > 0);
    }, [query, data]);

    useEffect(() => {
        const handler = setTimeout(() => {
            filterSuggestions();
        }, 300);
        return () => clearTimeout(handler);
    }, [query, filterSuggestions]);

    const handleSelect = (item) => {
        const displayName = item['ICD11_Title'] || 'N/A';
        const codes = [
            { system: 'ICD-11', code: item['ICD11_Code'], display: displayName },
            { system: 'NAMASTE-Ayurveda', code: item['Ayurveda_NAMC_CODE'], display: displayName },
            { system: 'NAMASTE-Siddha', code: item['Siddha_NAMC_CODE'], display: displayName },
            { system: 'NAMASTE-Unani', code: item['Unani_NUMC_CODE'], display: displayName },
        ].filter(c => c.code && c.code !== 'nan' && c.code.trim() !== '');
        
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
                onBlur={() => setTimeout(() => setIsActive(false), 200)}
                placeholder="Type diagnosis to search..."
                autoComplete="off"
                className="flex-grow p-2 border border-gray-300 rounded-md w-full"
            />
            {isActive && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                        <li key={idx} onMouseDown={() => handleSelect(item)} className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0">
                            <div className="font-semibold text-sm text-gray-800">{item['ICD11_Title']}</div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                <span><strong>ICD-11:</strong> {item['ICD11_Code'] || 'N/A'}</span>
                                <span><strong>Ayurveda:</strong> {item['Ayurveda_NAMC_CODE'] || 'N/A'}</span>
                                <span><strong>Siddha:</strong> {item['Siddha_NAMC_CODE'] || 'N/A'}</span>
                                <span><strong>Unani:</strong> {item['Unani_NUMC_CODE'] || 'N/A'}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DiagnosisAutocomplete;