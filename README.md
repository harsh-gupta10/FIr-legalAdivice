# FIR Form App

A mobile-first React Native app built with Expo to fill out, preview, and generate PDF copies of First Information Reports (FIR).

## Features

- **Multi-step Form Wizard** — 7 structured steps covering all FIR details
- **Client-Side Validation** — Required fields, format checks, real-time error messages
- **Draft Persistence** — Auto-save form progress locally using AsyncStorage
- **Form Preview** — Review all details before generating PDF
- **PDF Generation & Sharing** — Generate well-formatted PDF and share via native intent
- **Add Multiple Items** — Support for multiple witnesses and evidence entries
- **Responsive Mobile UI** — Optimized for Android and iOS

## Tech Stack

- **Framework**: React Native (Expo managed)
- **Styling**: React Native StyleSheet (no external CSS)
- **PDF Generation**: expo-print + expo-sharing
- **Date/Time**: @react-native-community/datetimepicker
- **State**: useState / useReducer
- **Storage**: @react-native-async-storage/async-storage

## Project Structure

```
├── App.js                      # Main entry point
├── screens/
│   ├── FormScreen.js          # Multi-step form with validation
│   └── PreviewScreen.js       # Review and PDF generation
├── components/
│   ├── FormInput.js           # Text input with validation display
│   ├── StepIndicator.js       # Progress indicator
│   ├── DateTimePickerField.js # Date/time selection
│   └── DropdownPicker.js      # Dropdown selector
├── utils/
│   ├── generatePDF.js         # HTML template + PDF generation
│   ├── storage.js             # AsyncStorage wrappers
│   └── validation.js          # Validation rules & initial state
├── package.json
├── app.json
└── babel.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Steps

1. **Navigate to the project folder:**
   ```bash
   cd /path/to/fir-form-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - **Android**: Press `a` to open on Android emulator or scan QR code with Expo Go app
   - **iOS**: Press `i` to open on iOS simulator or scan QR code with Camera app

## Form Sections

### 1. Complainant Details
- Full Name (required)
- Gender, Age
- Address (required)
- Phone Number (required)
- Email (optional)

### 2. Incident Details
- Date & Time of Incident
- Place of Occurrence
- Police Station
- District/City

### 3. Complaint Information
- Type of Offence (dropdown)
- Detailed Description (required, min 20 characters)

### 4. Accused Details (Optional)
- Name, Address, Description

### 5. Witness Details (Optional)
- Add multiple witnesses with name and contact info

### 6. Evidence Details (Optional)
- Add multiple evidence entries with descriptions

### 7. Declaration
- Acceptance checkbox for legal declaration

## Usage

1. **Fill Form** — Follow the step-by-step wizard, complete required fields
2. **Review** — Click "Review" to see all entered data
3. **Generate PDF** — Click "Share PDF" to generate a formatted FIR document
4. **Share** — Choose to share via email, WhatsApp, Google Drive, etc.
5. **Edit** — Click "Edit" to go back and modify any field
6. **Reset** — Clear all data and start fresh (confirmation required)

## PDF Output

The generated PDF includes:
- Well-structured sections with clear headings
- All form data in tabular/field format
- Multiple witness and evidence listings
- Signature placeholder area
- Date of report generation
- Professional formatting suitable for printing

## Features in Detail

### Draft Auto-Save
- Form progress is automatically saved to device storage after each step
- Closing and reopening the app resumes your progress
- Manual "Reset" button clears the draft

### Validation
- Required fields are marked with `*`
- Inline error messages appear below invalid fields
- Step cannot proceed until all required fields are valid

### Responsive UI
- Keyboard-aware scrolling prevents input fields from being hidden
- Touch-friendly button sizes for mobile
- Color-coded sections for clarity

### Android Support
- Full compatibility with Android 11+ (scoped storage)
- Uses Expo's built-in file sharing mechanism
- PDF can be shared to Gmail, WhatsApp, Drive, etc.

## Customization

### Change App Name
Edit `app.json`:
```json
{
  "name": "Your FIR App Name",
  "slug": "your-app-slug"
}
```

### Modify PDF Layout
Edit HTML template in `utils/generatePDF.js` → `generateHtml()` function

### Add Custom Validation Rules
Update rules in `utils/validation.js`

### Change Colors/Styling
Modify StyleSheet objects in respective component files

## Troubleshooting

### "Module not found" error
```bash
npm install
npx expo prebuild
```

### PDF not generating
- Ensure expo-print is installed: `npm install expo-print`
- Test on physical device (emulators may have limited print support)

### Draft not persisting
- Check AsyncStorage is installed: `npm install @react-native-async-storage/async-storage`
- Clear app cache and reinstall

### Date/Time picker not appearing
- Update @react-native-community/datetimepicker: `npm install @react-native-community/datetimepicker@latest`

## Testing Checklist

- [ ] Fill form with all required fields
- [ ] Skip optional fields and verify PDF still generates
- [ ] Add multiple witnesses and evidence items
- [ ] Close app mid-form and verify draft loads on restart
- [ ] Generate PDF and share to different apps (Gmail, Drive, etc.)
- [ ] Test on physical Android device (emulator may have limited share targets)
- [ ] Reset form and verify all fields are cleared
- [ ] Edit after review and confirm changes are preserved

## Performance Notes

- Form state is lightweight; no external heavy libraries used
- AsyncStorage uses simple JSON serialization
- PDF generation happens client-side (no server required)
- PDF file size typically 50–150 KB (depends on witness/evidence count)

## License

MIT

## Support

For issues or feature requests, refer to the Expo documentation:
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [expo-print](https://docs.expo.dev/versions/latest/sdk/print/)
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
