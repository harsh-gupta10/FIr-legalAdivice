Build a minimal app that allows users to fill out a First Information Report (FIR) form and download/share it as a PDF.

Note its a frontend only App. No need to save anything or connect to backedn or APIS

---

### Tech Stack

* Framework: React Native (Expo preferred)
* Styling: NativeWind (Tailwind for React Native) or StyleSheet
* PDF Generation: expo-print + expo-sharing OR react-native-pdf-lib
* State Management: useState / useReducer (no heavy libraries)

---

### Core Features

1. A multi-step FIR form with clear sections.
2. Input validation for required fields.
3. Ability to preview the FIR before generating PDF.
4. Generate a well-formatted PDF of the FIR.
5. Allow user to:

   * Download PDF
   * Share via WhatsApp, Email, etc.

---

### FIR Form Structure (MANDATORY)

#### 1. Complainant Details

* Full Name (required)
* Gender
* Age
* Address (required)
* Phone Number (required)
* Email (optional)

---

#### 2. Incident Details

* Date of Incident (required)
* Time of Incident (required)
* Place of Occurrence (required)
* Police Station (required) 
* District/City (required) 

---

#### 3. Complaint Information

* Type of Offence (dropdown: Theft, Assault, Fraud, Harassment, Other)
* Detailed Description (required, multiline text input)

---

#### 4. Accused Details (optional)

* Name
* Address
* Description

---

#### 5. Witness Details (optional) Can be multiple Witness So option to add witness

* Name
* Contact Information

---

#### 6. Evidence Details/ There can be multiple evicdences. 

* Description of Evidence
Option to add media as evedence 

---

#### 7. Declaration

* Checkbox:
  "I hereby declare that the information provided is true to the best of my knowledge."

---

### UI/UX Requirements

* Use a step-by-step form (wizard style with Next/Back buttons)
* Clean, minimal UI with proper spacing
* Use keyboard-aware scrolling
* Mobile-friendly inputs (date picker, time picker, dropdowns)
* Show validation errors clearly

---

### PDF Requirements

* Title: "First Information Report (FIR)"
* Include all sections in structured format
* Bold headings and clean layout
* Include:

  * Date of report generation
  * Signature placeholder
* Ensure proper margins and readability for printing

---

### Additional Features

* Save form progress locally using AsyncStorage
* Reset form option
* Edit before generating PDF
* Dark mode support (optional)

---

### File Structure

* components/

  * FormInput.js
  * StepIndicator.js
* screens/

  * FormScreen.js
  * PreviewScreen.js
* utils/

  * generatePDF.js

---

### Output Requirements

* Provide complete working Expo project code
* Include all dependencies
* Include instructions:

  * npm install
  * npx expo start
* Ensure PDF generation and sharing works correctly on Android

---

### Bonus (Optional)

* Add voice-to-text for description input
* Add location auto-fill using GPS
* Add FIR number auto-generation (local only, not official)

---

Ensure the app is simple, fast, and usable by non-technical users.