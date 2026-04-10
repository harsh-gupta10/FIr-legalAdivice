import React, { useReducer, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import StepIndicator from '../components/StepIndicator';
import FormInput from '../components/FormInput';
import DropdownPicker from '../components/DropdownPicker';
import DateTimePickerField from '../components/DateTimePickerField';
import { saveDraft, loadDraft } from '../utils/storage';
import { validateField, getInitialFormState } from '../utils/validation';

const STEPS = [
  'Complainant',
  'Incident',
  'Complaint',
  'Accused',
  'Witnesses',
  'Evidence',
  'Declaration',
];

const OFFENCE_TYPES = [
  { label: 'Theft', value: 'Theft' },
  { label: 'Assault', value: 'Assault' },
  { label: 'Fraud', value: 'Fraud' },
  { label: 'Harassment', value: 'Harassment' },
  { label: 'Other', value: 'Other' },
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
  { label: 'Not Specified', value: 'Not Specified' },
];

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'ADD_WITNESS':
      return {
        ...state,
        witnesses: [...state.witnesses, { name: '', contact: '' }],
      };
    case 'REMOVE_WITNESS':
      return {
        ...state,
        witnesses: state.witnesses.filter((_, idx) => idx !== action.payload),
      };
    case 'UPDATE_WITNESS':
      const updatedWitnesses = [...state.witnesses];
      updatedWitnesses[action.payload.index] = {
        ...updatedWitnesses[action.payload.index],
        [action.payload.field]: action.payload.value,
      };
      return { ...state, witnesses: updatedWitnesses };
    case 'ADD_EVIDENCE':
      return {
        ...state,
        evidence: [...state.evidence, { description: '' }],
      };
    case 'REMOVE_EVIDENCE':
      return {
        ...state,
        evidence: state.evidence.filter((_, idx) => idx !== action.payload),
      };
    case 'UPDATE_EVIDENCE':
      const updatedEvidence = [...state.evidence];
      updatedEvidence[action.payload.index] = {
        ...updatedEvidence[action.payload.index],
        description: action.payload.value,
      };
      return { ...state, evidence: updatedEvidence };
    case 'RESET':
      return getInitialFormState();
    case 'LOAD_DRAFT':
      return action.payload;
    default:
      return state;
  }
};

const FormScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, dispatch] = useReducer(formReducer, getInitialFormState());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDraftOnMount();
  }, []);

  const loadDraftOnMount = async () => {
    try {
      const draft = await loadDraft();
      if (draft) {
        dispatch({ type: 'LOAD_DRAFT', payload: draft });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      // Complainant Details
      if (!validateField('fullName', formData.fullName)) {
        newErrors.fullName = 'Full name is required (min 2 characters)';
      }
      if (!validateField('address', formData.address)) {
        newErrors.address = 'Address is required (min 5 characters)';
      }
      if (!validateField('phone', formData.phone)) {
        newErrors.phone = 'Valid phone number is required';
      }
      if (formData.email && !validateField('email', formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    } else if (currentStep === 1) {
      // Incident Details
      if (!validateField('dateOfIncident', formData.dateOfIncident)) {
        newErrors.dateOfIncident = 'Date of incident is required';
      }
      if (!validateField('timeOfIncident', formData.timeOfIncident)) {
        newErrors.timeOfIncident = 'Time of incident is required';
      }
      if (!validateField('placeOfOccurrence', formData.placeOfOccurrence)) {
        newErrors.placeOfOccurrence = 'Place of occurrence is required';
      }
      if (!validateField('policeStation', formData.policeStation)) {
        newErrors.policeStation = 'Police station is required';
      }
      if (!validateField('districtCity', formData.districtCity)) {
        newErrors.districtCity = 'District/City is required';
      }
    } else if (currentStep === 2) {
      // Complaint Information
      if (!validateField('description', formData.description)) {
        newErrors.description = 'Description is required (min 20 characters)';
      }
    } else if (currentStep === 6) {
      // Declaration
      if (!validateField('declaration', formData.declaration)) {
        newErrors.declaration = 'You must accept the declaration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      saveDraft(formData);
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset the entire form?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Reset',
          onPress: () => {
            dispatch({ type: 'RESET' });
            setErrors({});
            setCurrentStep(0);
            saveDraft(getInitialFormState());
          },
        },
      ]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Complainant Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complainant Details</Text>
            <FormInput
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => handleFieldChange('fullName', text)}
              placeholder="Enter full name"
              error={errors.fullName}
            />
            <DropdownPicker
              label="Gender"
              value={formData.gender}
              onValueChange={(value) => handleFieldChange('gender', value)}
              items={GENDER_OPTIONS}
            />
            <FormInput
              label="Age"
              value={formData.age}
              onChangeText={(text) => handleFieldChange('age', text)}
              placeholder="Enter age"
              keyboardType="number-pad"
            />
            <FormInput
              label="Address *"
              value={formData.address}
              onChangeText={(text) => handleFieldChange('address', text)}
              placeholder="Enter address"
              multiline
              error={errors.address}
            />
            <FormInput
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <FormInput
              label="Email (optional)"
              value={formData.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder="Enter email"
              keyboardType="email-address"
              error={errors.email}
            />
          </View>
        );

      case 1: // Incident Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Incident Details</Text>
            <DateTimePickerField
              label="Date of Incident *"
              value={formData.dateOfIncident}
              onChangeDate={(date) => handleFieldChange('dateOfIncident', date)}
              onChangeTime={() => {}}
              mode="date"
              error={errors.dateOfIncident}
            />
            <DateTimePickerField
              label="Time of Incident *"
              value={formData.timeOfIncident}
              onChangeDate={() => {}}
              onChangeTime={(time) => handleFieldChange('timeOfIncident', time)}
              mode="time"
              error={errors.timeOfIncident}
            />
            <FormInput
              label="Place of Occurrence *"
              value={formData.placeOfOccurrence}
              onChangeText={(text) => handleFieldChange('placeOfOccurrence', text)}
              placeholder="Enter place of occurrence"
              error={errors.placeOfOccurrence}
            />
            <FormInput
              label="Police Station *"
              value={formData.policeStation}
              onChangeText={(text) => handleFieldChange('policeStation', text)}
              placeholder="Enter police station name"
              error={errors.policeStation}
            />
            <FormInput
              label="District/City *"
              value={formData.districtCity}
              onChangeText={(text) => handleFieldChange('districtCity', text)}
              placeholder="Enter district or city"
              error={errors.districtCity}
            />
          </View>
        );

      case 2: // Complaint Information
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complaint Information</Text>
            <DropdownPicker
              label="Type of Offence"
              value={formData.offenceType}
              onValueChange={(value) => handleFieldChange('offenceType', value)}
              items={OFFENCE_TYPES}
            />
            <FormInput
              label="Detailed Description *"
              value={formData.description}
              onChangeText={(text) => handleFieldChange('description', text)}
              placeholder="Describe the incident in detail (minimum 20 characters)"
              multiline
              error={errors.description}
            />
          </View>
        );

      case 3: // Accused Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Accused Details (Optional)</Text>
            <Text style={styles.sectionNote}>
              Leave blank if accused details are unknown
            </Text>
            <FormInput
              label="Name"
              value={formData.accusedName}
              onChangeText={(text) => handleFieldChange('accusedName', text)}
              placeholder="Enter accused name"
            />
            <FormInput
              label="Address"
              value={formData.accusedAddress}
              onChangeText={(text) => handleFieldChange('accusedAddress', text)}
              placeholder="Enter accused address"
              multiline
            />
            <FormInput
              label="Description"
              value={formData.accusedDescription}
              onChangeText={(text) => handleFieldChange('accusedDescription', text)}
              placeholder="Describe physical appearance or other details"
              multiline
            />
          </View>
        );

      case 4: // Witnesses
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Witness Details (Optional)</Text>
            {formData.witnesses.length > 0 && (
              <View>
                {formData.witnesses.map((witness, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Witness {index + 1}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch({ type: 'REMOVE_WITNESS', payload: index })
                        }
                      >
                        <Text style={styles.removeButton}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    <FormInput
                      label="Name"
                      value={witness.name}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_WITNESS',
                          payload: { index, field: 'name', value: text },
                        })
                      }
                      placeholder="Enter witness name"
                    />
                    <FormInput
                      label="Contact Information"
                      value={witness.contact}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_WITNESS',
                          payload: { index, field: 'contact', value: text },
                        })
                      }
                      placeholder="Enter phone or address"
                    />
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => dispatch({ type: 'ADD_WITNESS' })}
            >
              <Text style={styles.addButtonText}>+ Add Witness</Text>
            </TouchableOpacity>
          </View>
        );

      case 5: // Evidence
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Evidence Details (Optional)</Text>
            {formData.evidence.length > 0 && (
              <View>
                {formData.evidence.map((evidence, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Evidence {index + 1}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch({ type: 'REMOVE_EVIDENCE', payload: index })
                        }
                      >
                        <Text style={styles.removeButton}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    <FormInput
                      label="Description"
                      value={evidence.description}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_EVIDENCE',
                          payload: { index, value: text },
                        })
                      }
                      placeholder="Describe the evidence"
                      multiline
                    />
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => dispatch({ type: 'ADD_EVIDENCE' })}
            >
              <Text style={styles.addButtonText}>+ Add Evidence</Text>
            </TouchableOpacity>
          </View>
        );

      case 6: // Declaration
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Declaration</Text>
            <View style={styles.declarationBox}>
              <Text style={styles.declarationText}>
                I hereby declare that the information provided in this First
                Information Report (FIR) is true to the best of my knowledge and
                belief. I understand that providing false information is an
                offense under the law.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                formData.declaration && styles.checkboxChecked,
              ]}
              onPress={() =>
                handleFieldChange('declaration', !formData.declaration)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.declaration && styles.checkboxInner,
                ]}
              >
                {formData.declaration && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I accept the declaration
              </Text>
            </TouchableOpacity>
            {errors.declaration && (
              <Text style={styles.errorText}>{errors.declaration}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepLabels={STEPS}
      />
      <KeyboardAwareScrollView
        style={styles.formContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={20}
      >
        {renderStep()}
      </KeyboardAwareScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, currentStep === 0 && styles.buttonDisabled]}
          onPress={handleBack}
          disabled={currentStep === 0}
        >
          <Text
            style={[
              styles.buttonText,
              currentStep === 0 && styles.buttonTextDisabled,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === STEPS.length - 1 ? 'Review' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  sectionNote: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
  },
  declarationBox: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#fbc02d',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  declarationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxInner: {
    borderColor: '#4caf50',
    backgroundColor: '#4caf50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FormScreen;
