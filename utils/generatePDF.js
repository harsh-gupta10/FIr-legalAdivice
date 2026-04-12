import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import { getCurrentLanguage, getLocaleTag, i18n, tForLocale } from '../i18n'

const generateHtml = (data, language = 'en') => {
  const localeTag = getLocaleTag(language)
  const tr = (key, options = {}) => tForLocale(language, key, options)

  const formatDate = (date) => {
    if (!date) return tr('common.noData')
    return new Date(date).toLocaleDateString(localeTag)
  }

  const formatTime = (time) => {
    if (!time) return tr('common.noData')
    return new Date(time).toLocaleTimeString(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const witnessesHtml =
    data.witnesses && data.witnesses.length > 0
      ? data.witnesses
          .map(
            (w, idx) => `
        <tr>
          <td style="border: 1px solid #333; padding: 8px;">${idx + 1}</td>
          <td style="border: 1px solid #333; padding: 8px;">${w.name || tr('common.noData')}</td>
          <td style="border: 1px solid #333; padding: 8px;">${w.contact || tr('common.noData')}</td>
        </tr>
      `,
          )
          .join('')
      : `<tr><td colspan="3" style="border: 1px solid #333; padding: 8px; text-align: center;">${tr('pdf.noWitnesses')}</td></tr>`

  const evidenceHtml =
    data.evidence && data.evidence.length > 0
      ? data.evidence
          .map(
            (e, idx) => `
        <tr>
          <td style="border: 1px solid #333; padding: 8px;">${idx + 1}</td>
          <td style="border: 1px solid #333; padding: 8px;">${e.description || tr('common.noData')}</td>
        </tr>
      `,
          )
          .join('')
      : `<tr><td colspan="2" style="border: 1px solid #333; padding: 8px; text-align: center;">${tr('pdf.noEvidence')}</td></tr>`

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
        <h1>${tr('pdf.title')}</h1>
        <p>${tr('fields.officialRecord')}</p>
        <p class="date-generated">${tr('fields.generatedOn')}: ${new Date().toLocaleString(localeTag)}</p>
      </div>

      <!-- SECTION 1: COMPLAINANT DETAILS -->
      <div class="section">
        <div class="section-title">${tr('pdf.section1')}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${tr('fields.fullName')}</div>
            <div class="field-value">${data.fullName || tr('common.noData')}</div>
          </div>
          <div class="field">
            <div class="field-label">${tr('fields.gender')}</div>
            <div class="field-value">${data.gender || tr('common.noData')}</div>
          </div>
          <div class="field">
            <div class="field-label">${tr('fields.age')}</div>
            <div class="field-value">${data.age || tr('common.noData')}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${tr('fields.phoneRequired')}</div>
            <div class="field-value">${data.phone || tr('common.noData')}</div>
          </div>
          <div class="field">
            <div class="field-label">${tr('common.email')}</div>
            <div class="field-value">${data.email || tr('common.noData')}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">${tr('common.address')}</div>
            <div class="field-value">${data.address || tr('common.noData')}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: INCIDENT DETAILS -->
      <div class="section">
        <div class="section-title">${tr('pdf.section2')}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${tr('fields.dateOfIncident')}</div>
            <div class="field-value">${formatDate(data.dateOfIncident)}</div>
          </div>
          <div class="field">
            <div class="field-label">${tr('fields.timeOfIncident')}</div>
            <div class="field-value">${formatTime(data.timeOfIncident)}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">${tr('fields.placeOfOccurrenceRequired')}</div>
            <div class="field-value">${data.placeOfOccurrence || tr('common.noData')}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${tr('fields.policeStation')}</div>
            <div class="field-value">${data.policeStation || tr('common.noData')}</div>
          </div>
          <div class="field">
            <div class="field-label">${tr('fields.districtCityRequired')}</div>
            <div class="field-value">${data.districtCity || tr('common.noData')}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: COMPLAINT INFORMATION -->
      <div class="section">
        <div class="section-title">${tr('pdf.section3')}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${tr('fields.typeOfOffence')}</div>
            <div class="field-value">${i18n.t(
              data.offenceType === 'Theft'
                ? 'offence.theft'
                : data.offenceType === 'Assault'
                  ? 'offence.assault'
                  : data.offenceType === 'Fraud'
                    ? 'offence.fraud'
                    : data.offenceType === 'Harassment'
                      ? 'offence.harassment'
                      : 'offence.other',
              { locale: language },
            )}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1 1 100%;">
            <div class="field-label">${tr('fields.detailedDescriptionRequired')}</div>
            <div class="field-value" style="min-height: 60px; white-space: pre-wrap;">${data.description || tr('common.noData')}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: ACCUSED DETAILS -->
      ${
        data.accusedName
          ? `
        <div class="section">
          <div class="section-title">${tr('pdf.section4')}</div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">${tr('common.name')}</div>
              <div class="field-value">${data.accusedName || tr('common.noData')}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">${tr('common.address')}</div>
              <div class="field-value">${data.accusedAddress || tr('common.noData')}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field" style="flex: 1 1 100%;">
              <div class="field-label">${tr('common.description')}</div>
              <div class="field-value" style="min-height: 40px; white-space: pre-wrap;">${data.accusedDescription || tr('common.noData')}</div>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- SECTION 5: WITNESS DETAILS -->
      <div class="section">
        <div class="section-title">${tr('pdf.section5')}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">${tr('fields.sNo')}</th>
              <th>${tr('common.name')}</th>
              <th>${tr('fields.contactInformation')}</th>
            </tr>
          </thead>
          <tbody>
            ${witnessesHtml}
          </tbody>
        </table>
      </div>

      <!-- SECTION 6: EVIDENCE DETAILS -->
      <div class="section">
        <div class="section-title">${tr('pdf.section6')}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">${tr('fields.sNo')}</th>
              <th>${tr('fields.evidenceDescription')}</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceHtml}
          </tbody>
        </table>
      </div>

      <!-- SECTION 7: DECLARATION -->
      <div class="section declaration-section">
        <div class="section-title">${tr('pdf.section7')}</div>
        <p>${tr('pdf.declarationText')}</p>
        <div class="signature-section">
          <div class="signature-box">
            <p>${tr('fields.signaturePlaceholder')}</p>
          </div>
          <div class="signature-box">
            <p>${tr('fields.datePlaceholder')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

export const generateAndSharePDF = async (
  formData,
  language = getCurrentLanguage(),
) => {
  try {
    const html = generateHtml(formData, language)
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    })

    if (Platform.OS === 'web') {
      // For web, you'd need a different approach
      console.log('PDF generated at:', uri)
      return uri
    }

    // Share the PDF
    const canShare = await Sharing.isAvailableAsync()
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: tForLocale(language, 'pdf.shareDialogTitle'),
        UTI: 'com.adobe.pdf',
      })
    } else {
      console.log('Sharing not available on this platform')
    }

    return uri
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export const generatePDF = async (
  formData,
  language = getCurrentLanguage(),
) => {
  try {
    const html = generateHtml(formData, language)
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    })
    return uri
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
