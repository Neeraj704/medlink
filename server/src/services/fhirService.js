const { randomUUID } = require('crypto');

/**
 * Creates a FHIR R4 Bundle for a consultation.
 * @param {object} data - The consultation data.
 * @param {object} data.patientData - Patient information.
 * @param {object} data.doctorData - Doctor information.
 * @param {Array<object>} data.diagnoses - List of diagnoses.
 * @param {Array<object>} data.medications - List of medications.
 * @returns {object} A FHIR R4 Bundle resource.
 */
const createFhirBundle = ({ patientData, doctorData, diagnoses, medications }) => {
    const bundleId = randomUUID();
    const now = new Date().toISOString();

    const resources = [];

    // --- MODIFIED: Patient Resource Identifier Logic ---
    const patientIdentifiers = [];
    // Add ABHA number if it exists
    if (patientData.abhaNumber) {
        patientIdentifiers.push({
            system: 'https://healthid.ndhm.gov.in',
            value: patientData.abhaNumber
        });
    } else {
        // Fallback to a local system identifier if no ABHA number
        patientIdentifiers.push({
            system: 'https://medlink.local/patient-id',
            value: patientData.id
        });
    }

    // 1. Patient Resource
    const patientResource = {
        resourceType: 'Patient',
        id: patientData.id,
        identifier: patientIdentifiers, // Use the flexible identifier array
        name: [{
            text: patientData.name
        }],
        gender: patientData.demographics?.gender?.toLowerCase() || 'unknown',
    };
    resources.push({ fullUrl: `urn:uuid:${patientData.id}`, resource: patientResource });

    // 2. Practitioner Resource
    const practitionerResource = {
        resourceType: 'Practitioner',
        id: doctorData.id,
        identifier: [{
            system: 'https://hpr.abdm.gov.in',
            value: doctorData.hprId
        }],
        name: [{
            text: doctorData.name
        }],
    };
    resources.push({ fullUrl: `urn:uuid:${doctorData.id}`, resource: practitionerResource });

    const encounterResourceId = randomUUID();
    // 3. Encounter Resource
    const encounterResource = {
        resourceType: 'Encounter',
        id: encounterResourceId,
        status: 'finished',
        class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'ambulatory'
        },
        subject: { reference: `urn:uuid:${patientData.id}` },
        participant: [{
            individual: { reference: `urn:uuid:${doctorData.id}` }
        }],
        period: {
            start: now
        }
    };
    resources.push({ fullUrl: `urn:uuid:${encounterResourceId}`, resource: encounterResource });
    
    const sectionEntries = [];

    // 4. Condition (Diagnoses) Resources
    diagnoses.forEach((diag) => {
        const conditionId = randomUUID();
        const conditionResource = {
            resourceType: 'Condition',
            id: conditionId,
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
            verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
            code: {
                coding: diag.codes.map(c => ({
                    system: c.system,
                    code: c.code,
                    display: c.display
                })),
                text: diag.name
            },
            subject: { reference: `urn:uuid:${patientData.id}` },
            encounter: { reference: `urn:uuid:${encounterResourceId}` }
        };
        resources.push({ fullUrl: `urn:uuid:${conditionId}`, resource: conditionResource });
        sectionEntries.push({ reference: `urn:uuid:${conditionId}` });
    });

    // 5. MedicationRequest Resources
    medications.forEach((med) => {
        const medRequestId = randomUUID();
        const medRequestResource = {
            resourceType: 'MedicationRequest',
            id: medRequestId,
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
                text: med.name
            },
            subject: { reference: `urn:uuid:${patientData.id}` },
            encounter: { reference: `urn:uuid:${encounterResourceId}` },
            authoredOn: now,
            requester: { reference: `urn:uuid:${doctorData.id}` },
            dosageInstruction: [{
                text: `${med.dosage}, ${med.frequency} for ${med.duration}`
            }]
        };
        resources.push({ fullUrl: `urn:uuid:${medRequestId}`, resource: medRequestResource });
        sectionEntries.push({ reference: `urn:uuid:${medRequestId}` });
    });

    const compositionResourceId = randomUUID();
    // 6. Composition Resource (to tie it all together)
    const compositionResource = {
        resourceType: 'Composition',
        id: compositionResourceId,
        status: 'final',
        type: {
            coding: [{
                system: 'http://loinc.org',
                code: '11502-2',
                display: 'Consultation note'
            }]
        },
        date: now,
        author: [{ reference: `urn:uuid:${doctorData.id}` }],
        title: 'Consultation Record',
        subject: { reference: `urn:uuid:${patientData.id}` },
        encounter: { reference: `urn:uuid:${encounterResourceId}` },
        section: [{
            title: 'Clinical Findings and Plan',
            entry: sectionEntries
        }]
    };
    resources.push({ fullUrl: `urn:uuid:${compositionResourceId}`, resource: compositionResource });


    const bundle = {
        resourceType: 'Bundle',
        id: bundleId,
        type: 'document',
        timestamp: now,
        entry: resources,
    };

    return bundle;
};


module.exports = {
    createFhirBundle,
};