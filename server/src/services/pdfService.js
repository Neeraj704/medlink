const puppeteer = require('puppeteer');
const logger = require('../lib/logger');

const generateHtmlForPdf = (consultation) => {
    const { patient, doctor, date, diagnoses, medications, notes } = consultation;
    
    const diagnosesHtml = diagnoses.map(d => `<li><b>${d.name}</b>: ${d.codes.map(c => `<code>${c.system}:${c.code}</code>`).join(', ')}</li>`).join('');
    const medicationsHtml = medications.map(m => `<li><b>${m.name}</b>: ${m.dosage}, ${m.frequency} for ${m.duration}.</li>`).join('');

    // --- FIXED: Conditional logic for patient identifier ---
    const patientIdentifierHtml = patient.abhaNumber
        ? `<tr><th>Patient ABHA Number</th><td>${patient.abhaNumber}</td></tr>`
        : patient.aadharNumber
        ? `<tr><th>Patient Aadhaar Number</th><td>${patient.aadharNumber}</td></tr>`
        : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Consultation Record - ${consultation.id}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; padding: 30px; }
                .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { margin: 0; color: #1a1a1a; }
                .header p { margin: 5px 0; color: #555; }
                .section { margin-bottom: 25px; }
                .section h2 { border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px; color: #222; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 10px; border: 1px solid #eee; }
                th { background-color: #f9f9f9; }
                ul { padding-left: 20px; }
                code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
                .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #888; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MedLink Clinical Consultation Record</h1>
                <p>Record ID: ${consultation.id}</p>
            </div>

            <div class="section">
                <h2>Patient & Doctor Details</h2>
                <table>
                    <tr>
                        <th>Patient Name</th>
                        <td>${patient.user.name}</td>
                    </tr>
                    ${patientIdentifierHtml}
                     <tr>
                        <th>Consultation Date</th>
                        <td>${new Date(date).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th>Consulting Doctor</th>
                        <td>Dr. ${doctor.user.name}</td>
                    </tr>
                    <tr>
                        <th>Doctor HPR ID</th>
                        <td>${doctor.hprId}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <h2>Diagnoses</h2>
                <ul>${diagnosesHtml}</ul>
            </div>

            <div class="section">
                <h2>Prescribed Medications</h2>
                <ul>${medicationsHtml}</ul>
            </div>

            ${notes ? `
            <div class="section">
                <h2>Additional Notes</h2>
                <p>${notes}</p>
            </div>
            ` : ''}

            <div class="footer">
                 <p>This is a system-generated document.</p>
            </div>
        </body>
        </html>
    `;
};

const generateConsultationPdf = async (consultation) => {
    let browser;
    try {
        logger.info(`Launching Puppeteer to generate PDF for consultation ${consultation.id}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        const htmlContent = generateHtmlForPdf(consultation);
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });
        
        logger.info(`Successfully generated PDF for consultation ${consultation.id}`);
        return pdfBuffer;

    } catch (error) {
        logger.error(error, 'Failed to generate PDF using Puppeteer.');
        throw new Error('Could not generate PDF.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = {
    generateConsultationPdf,
};