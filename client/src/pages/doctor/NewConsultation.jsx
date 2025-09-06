import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';

import Step1PatientVitals from '../../components/consultation/Step1PatientVitals';
import Step2Diagnosis from '../../components/consultation/Step2Diagnosis';
import Step3Medication from '../../components/consultation/Step3Medication';
import Step4Review from '../../components/consultation/Step4Review';

const NewConsultation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [consultationData, setConsultationData] = useState({
        vitals: {},
        diagnoses: [{ name: '', codes: [] }],
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
    });

    useEffect(() => {
        // This effect runs ONCE on mount to check for patient data.
        if (location.state?.patient) {
            setPatient(location.state.patient);
        } else {
            // If patient data is missing, we redirect back to the dashboard immediately.
            console.error("NewConsultation loaded without patient data. Redirecting.");
            navigate('/doctor/dashboard', { replace: true });
        }
        // We disable the exhaustive-deps rule here intentionally.
        // Adding 'location' or 'navigate' would re-create the infinite loop.
        // This check only needs to happen on the initial mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownloadJson = (data, filename) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        const finalData = {
            patientIdentifier: patient.abhaNumber,
            vitals: consultationData.vitals,
            diagnoses: consultationData.diagnoses.filter(d => d.name),
            medications: consultationData.medications.filter(m => m.name),
            notes: consultationData.notes,
        };

        try {
            const response = await api.post('/doctor/consultation', finalData);
            setSuccess('Consultation saved! Downloading FHIR record...');

            const patientName = patient.name.replace(/\s+/g, '_');
            handleDownloadJson(response.data.consultation.fhirBundle, `${patientName}_FHIR.json`);
            
            setTimeout(() => navigate('/doctor/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save consultation.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1PatientVitals data={consultationData.vitals} setData={vitals => setConsultationData(prev => ({ ...prev, vitals }))} onNext={nextStep} />;
            case 2:
                return <Step2Diagnosis data={consultationData.diagnoses} setData={diagnoses => setConsultationData(prev => ({ ...prev, diagnoses }))} onNext={nextStep} onBack={prevStep} />;
            case 3:
                return <Step3Medication data={consultationData.medications} setData={medications => setConsultationData(prev => ({ ...prev, medications }))} onNext={nextStep} onBack={prevStep} />;
            case 4:
                return <Step4Review consultationData={consultationData} setNotes={notes => setConsultationData(prev => ({ ...prev, notes }))} onBack={prevStep} onSubmit={handleSubmit} loading={loading} />;
            default:
                return <div>Invalid Step</div>;
        }
    };

    // Render a loader or null while the patient state is being set to prevent rendering the form prematurely
    if (!patient) {
        return <Loader />;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">New Consultation</h1>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h2 className="font-semibold text-lg">{patient.name}</h2>
                <p className="text-sm text-gray-600">ABHA: {patient.abhaNumber}</p>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}

            {renderStep()}
        </div>
    );
};

export default NewConsultation;