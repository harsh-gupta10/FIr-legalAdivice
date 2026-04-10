export const VALIDATION_RULES = {
  fullName: (value) => value && value.trim().length >= 2,
  address: (value) => value && value.trim().length >= 5,
  phone: (value) => /^[\d\s\-\+\(\)]{10,15}$/.test(value?.replace(/\s/g, '') || ''),
  email: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  dateOfIncident: (value) => value !== null && value !== undefined,
  timeOfIncident: (value) => value !== null && value !== undefined,
  placeOfOccurrence: (value) => value && value.trim().length >= 3,
  policeStation: (value) => value && value.trim().length >= 2,
  districtCity: (value) => value && value.trim().length >= 2,
  offenceType: (value) => value && value.length > 0,
  description: (value) => value && value.trim().length >= 20,
  declaration: (value) => value === true,
};

export const validateField = (fieldName, value) => {
  const rule = VALIDATION_RULES[fieldName];
  if (!rule) return true;
  return rule(value);
};

export const getInitialFormState = () => ({
  // Complainant Details
  fullName: '',
  gender: 'Not Specified',
  age: '',
  address: '',
  phone: '',
  email: '',
  
  // Incident Details
  dateOfIncident: null,
  timeOfIncident: null,
  placeOfOccurrence: '',
  policeStation: '',
  districtCity: '',
  
  // Complaint Information
  offenceType: 'Theft',
  description: '',
  
  // Accused Details
  accusedName: '',
  accusedAddress: '',
  accusedDescription: '',
  
  // Witnesses
  witnesses: [],
  
  // Evidence
  evidence: [],
  
  // Declaration
  declaration: false,
});
