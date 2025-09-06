// FILE: server/src/services/fhirService.js

const { randomUUID } = require('crypto');

/**
 * Creates FHIR Observation resources for vitals.
 * @param {object} vitals - The vitals data.
 * @param {string} patientId - The patient's resource ID.
 * @param {string} encounterId - The encounter's resource ID.
 * @returns {Array<object>} An array of FHIR Observation resources.
 */
const createVitalsObservations = (vitals, patientId, encounterId) => {
    const observations = [];
    const now = new Date().toISOString();

    const vitalsMap = {
        height: { code: '8302-2', unit: 'cm', display: 'Body Height' },
        weight: { code: '29463-7', unit: 'kg', display: 'Body Weight' },
        bloodPressure: { code: '85354-9', unit: 'mm[Hg]', display: 'Blood Pressure' },
        temperature: { code: '8310-5', unit: 'Cel', display: 'Body Temperature' },
        pulse: { code: '8867-4', unit: '/min', display: 'Heart rate' },
    };
    
    for (const [key, value] of Object.entries(vitals)) {
        if (value && vitalsMap[key]) {
            const vital = vitalsMap[key];
            const observationId = randomUUID();
            let observationResource;

            if (key === 'bloodPressure' && String(value).includes('/')) {
                const [systolic, diastolic] = value.split('/');
                observationResource = {
                    resourceType: 'Observation',
                    id: observationId,
                    status: 'final',
                    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
                    code: { coding: [{ system: 'http://loinc.org', code: vital.code, display: vital.display }], text: vital.display },
                    subject: { reference: `urn:uuid:${patientId}` },
                    encounter: { reference: `urn:uuid:${encounterId}` },
                    effectiveDateTime: now,
                    component: [
                        { code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] }, valueQuantity: { value: parseFloat(systolic), unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' } },
                        { code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] }, valueQuantity: { value: parseFloat(diastolic), unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' } }
                    ]
                };
            } else {
                 observationResource = {
                    resourceType: 'Observation',
                    id: observationId,
                    status: 'final',
                    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
                    code: { coding: [{ system: 'http://loinc.org', code: vital.code, display: vital.display }], text: vital.display },
                    subject: { reference: `urn:uuid:${patientId}` },
                    encounter: { reference: `urn:uuid:${encounterId}` },
                    effectiveDateTime: now,
                    valueQuantity: {
                        value: parseFloat(value),
                        unit: vital.unit,
                        system: 'http://unitsofmeasure.org',
                    },
                };
            }
            observations.push({ fullUrl: `urn:uuid:${observationId}`, resource: observationResource });
        }
    }
    return observations;
};


const createFhirBundle = ({ patientData, doctorData, vitals, diagnoses, medications }) => {
    const bundleId = randomUUID();
    const now = new Date().toISOString();

    let resources = [];

    const patientIdentifiers = [];
    if (patientData.abhaNumber) {
        patientIdentifiers.push({
            system: 'https://healthid.ndhm.gov.in',
            value: patientData.abhaNumber
        });
    } else {
        patientIdentifiers.push({
            system: 'https://medlink.local/patient-id',
            value: patientData.id
        });
    }

    const patientResource = {
        resourceType: 'Patient',
        id: patientData.id,
        identifier: patientIdentifiers,
        name: [{ text: patientData.name }],
        gender: patientData.demographics?.gender?.toLowerCase() || 'unknown',
    };
    resources.push({ fullUrl: `urn:uuid:${patientData.id}`, resource: patientResource });

    const practitionerResource = {
        resourceType: 'Practitioner',
        id: doctorData.id,
        identifier: [{ system: 'https://hpr.abdm.gov.in', value: doctorData.hprId }],
        name: [{ text: doctorData.name }],
    };
    resources.push({ fullUrl: `urn:uuid:${doctorData.id}`, resource: practitionerResource });

    const encounterResourceId = randomUUID();
    const encounterResource = {
        resourceType: 'Encounter',
        id: encounterResourceId,
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
        subject: { reference: `urn:uuid:${patientData.id}` },
        participant: [{ individual: { reference: `urn:uuid:${doctorData.id}` } }],
        period: { start: now }
    };
    resources.push({ fullUrl: `urn:uuid:${encounterResourceId}`, resource: encounterResource });
    
    if(vitals) {
        const observationResources = createVitalsObservations(vitals, patientData.id, encounterResourceId);
        resources = [...resources, ...observationResources];
    }
    const sectionEntries = [];

    diagnoses.forEach((diag) => {
        const conditionId = randomUUID();
        const conditionResource = {
            resourceType: 'Condition',
            id: conditionId,
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
            verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
            code: {
                coding: diag.codes.map(c => ({ system: c.system, code: c.code, display: c.display })),
                text: diag.name
            },
            subject: { reference: `urn:uuid:${patientData.id}` },
            encounter: { reference: `urn:uuid:${encounterResourceId}` }
        };
        resources.push({ fullUrl: `urn:uuid:${conditionId}`, resource: conditionResource });
        sectionEntries.push({ reference: `urn:uuid:${conditionId}` });
    });

    medications.forEach((med) => {
        const medRequestId = randomUUID();
        const medRequestResource = {
            resourceType: 'MedicationRequest',
            id: medRequestId,
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: { text: med.name },
            subject: { reference: `urn:uuid:${patientData.id}` },
            encounter: { reference: `urn:uuid:${encounterResourceId}` },
            authoredOn: now,
            requester: { reference: `urn:uuid:${doctorData.id}` },
            dosageInstruction: [{ text: `${med.dosage}, ${med.frequency} for ${med.duration}` }]
        };
        resources.push({ fullUrl: `urn:uuid:${medRequestId}`, resource: medRequestResource });
        sectionEntries.push({ reference: `urn:uuid:${medRequestId}` });
    });

    const compositionResourceId = randomUUID();
    const compositionResource = {
        resourceType: 'Composition',
        id: compositionResourceId,
        status: 'final',
        type: { coding: [{ system: 'http://loinc.org', code: '11502-2', display: 'Consultation note' }] },
        date: now,
        author: [{ reference: `urn:uuid:${doctorData.id}` }],
        title: 'Consultation Record',
        subject: { reference: `urn:uuid:${patientData.id}` },
        encounter: { reference: `urn:uuid:${encounterResourceId}` },
        section: [{ title: 'Clinical Findings and Plan', entry: sectionEntries }]
    };
    resources.push({ fullUrl: `urn:uuid:${compositionResourceId}`, resource: compositionResource });


    return {
        resourceType: 'Bundle',
        id: bundleId,
        type: 'document',
        timestamp: now,
        entry: resources,
    };
};

module.exports = { createFhirBundle };