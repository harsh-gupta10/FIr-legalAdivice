import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const generateHtml = (data) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const witnessesHtml = data.witnesses && data.witnesses.length > 0
    ? data.witnesses.map((w, idx) => `
        <tr>
          <td style="border: 1px solid #333; padding: 8px;">${idx + 1}</td>
          <td style="border: 1px solid #333; padding: 8px;">${w.name || 'N/A'}</td>
          <td style="border: 1px solid #333; padding: 8px;">${w.contact || 'N/A'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="border: 1px solid #333; padding: 8px; text-align: center;">No witnesses recorded</td></tr>';

  const evidenceHtml = data.evidence && data.evidence.length > 0
    ? data.evidence.map((e, idx) => `
        <tr>
          <td style="border: 1px solid #333; padding: 8px;">${idx + 1}</td>
          <td style="border: 1px solid #333; padding: 8px;">${e.description || 'N/A'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="2" style="border: 1px solid #333; padding: 8px; text-align: center;">No evidence recorded</td></tr>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>FIR Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #000;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0;
          font-size: 12px;
          color: #666;
        }
        .section {
          margin: 20px 0;
          page-break-inside: avoid;
        }
        .section-title {
          background-color: #f0f0f0;
          padding: 10px;
          font-size: 14px;
          font-weight: bold;
          border-left: 4px solid #000;
          margin-bottom: 10px;
        }
        .field-row {
          display: flex;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .field {
          flex: 1;
          min-width: 250px;
          margin-right: 20px;
        }
        .field-label {
          font-weight: bold;
          font-size: 12px;
          color: #555;
          margin-bottom: 3px;
        }
        .field-value {
          font-size: 13px;
          padding: 6px 8px;
          background-color: #fafafa;
          border: 1px solid #ddd;
          border-radius: 3px;
          min-height: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          background-color: #e0e0e0;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
          border: 1px solid #333;
        }
        td {
          padding: 8px;
          font-size: 12px;
        }
        .declaration-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          padding-top: 40px;
        }
        .signature-box {
          width: 150px;
          border-top: 1px solid #000;
          text-align: center;
          font-size: 11px;
        }
        .date-generated {
          font-size: 11px;
          color: #666;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>First Information Report (FIR)</h1>
        <p>Official Record of Complaint</p>
        <p class="date-generated">Generated on: ${new Date().toLocaleString('en-IN')}</p>
      </div>

      <!-- SECTION 1: COMPLAINANT DETAILS -->
      <div class="section">
        <div class="section-title">1. COMPLAINANT DETAILS</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">Full Name</div>
            <div class="field-value">${data.fullName || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">Gender</div>
            <div class="field-value">${data.gender || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">Age</div>
            <div class="field-value">${data.age || 'N/A'}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">Phone Number</div>
            <div class="field-value">${data.phone || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${data.email || 'N/A'}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">Address</div>
            <div class="field-value">${data.address || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: INCIDENT DETAILS -->
      <div class="section">
        <div class="section-title">2. INCIDENT DETAILS</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">Date of Incident</div>
            <div class="field-value">${formatDate(data.dateOfIncident)}</div>
          </div>
          <div class="field">
            <div class="field-label">Time of Incident</div>
            <div class="field-value">${formatTime(data.timeOfIncident)}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">Place of Occurrence</div>
            <div class="field-value">${data.placeOfOccurrence || 'N/A'}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">Police Station</div>
            <div class="field-value">${data.policeStation || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">District/City</div>
            <div class="field-value">${data.districtCity || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: COMPLAINT INFORMATION -->
      <div class="section">
        <div class="section-title">3. COMPLAINT INFORMATION</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">Type of Offence</div>
            <div class="field-value">${data.offenceType || 'N/A'}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">Detailed Description</div>
            <div class="field-value" style="min-height: 60px; white-space: pre-wrap;">${data.description || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: ACCUSED DETAILS -->
      ${data.accusedName ? `
        <div class="section">
          <div class="section-title">4. ACCUSED DETAILS</div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">Name</div>
              <div class="field-value">${data.accusedName || 'N/A'}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">Address</div>
              <div class="field-value">${data.accusedAddress || 'N/A'}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">Description</div>
              <div class="field-value" style="min-height: 40px; white-space: pre-wrap;">${data.accusedDescription || 'N/A'}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- SECTION 5: WITNESS DETAILS -->
      <div class="section">
        <div class="section-title">5. WITNESS DETAILS</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
              <th>Name</th>
              <th>Contact Information</th>
            </tr>
          </thead>
          <tbody>
            ${witnessesHtml}
          </tbody>
        </table>
      </div>

      <!-- SECTION 6: EVIDENCE DETAILS -->
      <div class="section">
        <div class="section-title">6. EVIDENCE DETAILS</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
              <th>Description of Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceHtml}
          </tbody>
        </table>
      </div>

      <!-- SECTION 7: DECLARATION -->
      <div class="section declaration-section">
        <div class="section-title">7. DECLARATION</div>
        <p>I hereby declare that the information provided in this FIR is true to the best of my knowledge and belief.</p>
        <div class="signature-section">
          <div class="signature-box">
            <p>Complainant Signature</p>
          </div>
          <div class="signature-box">
            <p>Date: _______________</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

export const generateAndSharePDF = async (formData) => {
  try {
    const html = generateHtml(formData);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === 'web') {
      // For web, you'd need a different approach
      console.log('PDF generated at:', uri);
      return uri;
    }

    // Share the PDF
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share FIR PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.log('Sharing not available on this platform');
    }

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generatePDF = async (formData) => {
  try {
    const html = generateHtml(formData);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
