import React, { useReducer, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import StepIndicator from '../components/StepIndicator'
import FormInput from '../components/FormInput'
import DropdownPicker from '../components/DropdownPicker'
import DateTimePickerField from '../components/DateTimePickerField'
import { saveDraft, loadDraft } from '../utils/storage'
import { validateField, getInitialFormState } from '../utils/validation'
import { getOffenceLabel, t } from '../i18n'

const OFFENCE_VALUES = ['Theft', 'Assault', 'Fraud', 'Harassment', 'Other']
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Not Specified']

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value }
    case 'ADD_WITNESS':
      return {
        ...state,
        witnesses: [...state.witnesses, { name: '', contact: '' }],
      }
    case 'REMOVE_WITNESS':
      return {
        ...state,
        witnesses: state.witnesses.filter((_, idx) => idx !== action.payload),
      }
    case 'UPDATE_WITNESS':
      const updatedWitnesses = [...state.witnesses]
      updatedWitnesses[action.payload.index] = {
        ...updatedWitnesses[action.payload.index],
        [action.payload.field]: action.payload.value,
      }
      return { ...state, witnesses: updatedWitnesses }
    case 'ADD_EVIDENCE':
      return {
        ...state,
        evidence: [...state.evidence, { description: '' }],
      }
    case 'REMOVE_EVIDENCE':
      return {
        ...state,
        evidence: state.evidence.filter((_, idx) => idx !== action.payload),
      }
    case 'UPDATE_EVIDENCE':
      const updatedEvidence = [...state.evidence]
      updatedEvidence[action.payload.index] = {
        ...updatedEvidence[action.payload.index],
        description: action.payload.value,
      }
      return { ...state, evidence: updatedEvidence }
    case 'RESET':
      return getInitialFormState()
    case 'LOAD_DRAFT':
      return action.payload
    default:
      return state
  }
}

const FormScreen = ({ onComplete }) => {
  const steps = [
    t('sections.complainantDetails'),
    t('sections.incidentDetails'),
    t('sections.complaintInformation'),
    t('sections.accusedDetails'),
    t('sections.witnessDetails'),
    t('sections.evidenceDetails'),
    t('sections.declaration'),
  ]

  const offenceOptions = OFFENCE_VALUES.map((value) => ({
    label: getOffenceLabel(value),
    value,
  }))

  const genderOptions = GENDER_OPTIONS.map((value) => ({
    label:
      value === 'Male'
        ? t('genderOptions.male')
        : value === 'Female'
          ? t('genderOptions.female')
          : value === 'Other'
            ? t('genderOptions.other')
            : t('genderOptions.notSpecified'),
    value,
  }))

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, dispatch] = useReducer(formReducer, getInitialFormState())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadDraftOnMount()
  }, [])

  const loadDraftOnMount = async () => {
    try {
      const draft = await loadDraft()
      if (draft) {
        dispatch({ type: 'LOAD_DRAFT', payload: draft })
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateStep = () => {
    const newErrors = {}

    if (currentStep === 0) {
      // Complainant Details
      if (!validateField('fullName', formData.fullName)) {
        newErrors.fullName = t('validation.fullNameRequired')
      }
      if (!validateField('address', formData.address)) {
        newErrors.address = t('validation.addressRequired')
      }
      if (!validateField('phone', formData.phone)) {
        newErrors.phone = t('validation.phoneRequired')
      }
      if (formData.email && !validateField('email', formData.email)) {
        newErrors.email = t('validation.emailInvalid')
      }
    } else if (currentStep === 1) {
      // Incident Details
      if (!validateField('dateOfIncident', formData.dateOfIncident)) {
        newErrors.dateOfIncident = t('validation.dateRequired')
      }
      if (!validateField('timeOfIncident', formData.timeOfIncident)) {
        newErrors.timeOfIncident = t('validation.timeRequired')
      }
      if (!validateField('placeOfOccurrence', formData.placeOfOccurrence)) {
        newErrors.placeOfOccurrence = t('validation.placeRequired')
      }
      if (!validateField('policeStation', formData.policeStation)) {
        newErrors.policeStation = t('validation.policeStationRequired')
      }
      if (!validateField('districtCity', formData.districtCity)) {
        newErrors.districtCity = t('validation.districtRequired')
      }
    } else if (currentStep === 2) {
      // Complaint Information
      if (!validateField('description', formData.description)) {
        newErrors.description = t('validation.descriptionRequired')
      }
    } else if (currentStep === 6) {
      // Declaration
      if (!validateField('declaration', formData.declaration)) {
        newErrors.declaration = t('validation.declarationRequired')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      saveDraft(formData)
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete(formData)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    Alert.alert(
      t('alerts.resetFormTitle'),
      t('alerts.resetEntireFormConfirm'),
      [
        { text: t('common.cancel'), onPress: () => {} },
        {
          text: t('app.reset'),
          onPress: () => {
            dispatch({ type: 'RESET' })
            setErrors({})
            setCurrentStep(0)
            saveDraft(getInitialFormState())
          },
        },
      ],
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Complainant Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.complainantDetails')}
            </Text>
            <FormInput
              label={t('fields.fullNameRequired')}
              value={formData.fullName}
              onChangeText={(text) => handleFieldChange('fullName', text)}
              placeholder={t('placeholders.enterFullName')}
              error={errors.fullName}
            />
            <DropdownPicker
              label={t('fields.gender')}
              value={formData.gender}
              onValueChange={(value) => handleFieldChange('gender', value)}
              items={genderOptions}
            />
            <FormInput
              label={t('fields.age')}
              value={formData.age}
              onChangeText={(text) => handleFieldChange('age', text)}
              placeholder={t('placeholders.enterAge')}
              keyboardType="number-pad"
            />
            <FormInput
              label={t('fields.addressRequired')}
              value={formData.address}
              onChangeText={(text) => handleFieldChange('address', text)}
              placeholder={t('placeholders.enterAddress')}
              multiline
              error={errors.address}
            />
            <FormInput
              label={t('fields.phoneRequired')}
              value={formData.phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              placeholder={t('placeholders.enterPhone')}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <FormInput
              label={t('fields.emailOptional')}
              value={formData.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder={t('placeholders.enterEmail')}
              keyboardType="email-address"
              error={errors.email}
            />
          </View>
        )

      case 1: // Incident Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.incidentDetails')}
            </Text>
            <DateTimePickerField
              label={t('fields.dateOfIncidentRequired')}
              value={formData.dateOfIncident}
              onChangeDate={(date) => handleFieldChange('dateOfIncident', date)}
              onChangeTime={() => {}}
              mode="date"
              error={errors.dateOfIncident}
            />
            <DateTimePickerField
              label={t('fields.timeOfIncidentRequired')}
              value={formData.timeOfIncident}
              onChangeDate={() => {}}
              onChangeTime={(time) => handleFieldChange('timeOfIncident', time)}
              mode="time"
              error={errors.timeOfIncident}
            />
            <FormInput
              label={t('fields.placeOfOccurrenceRequired')}
              value={formData.placeOfOccurrence}
              onChangeText={(text) =>
                handleFieldChange('placeOfOccurrence', text)
              }
              placeholder={t('placeholders.location')}
              error={errors.placeOfOccurrence}
            />
            <FormInput
              label={t('fields.policeStationRequired')}
              value={formData.policeStation}
              onChangeText={(text) => handleFieldChange('policeStation', text)}
              placeholder={t('placeholders.stationName')}
              error={errors.policeStation}
            />
            <FormInput
              label={t('fields.districtCityRequired')}
              value={formData.districtCity}
              onChangeText={(text) => handleFieldChange('districtCity', text)}
              placeholder={t('placeholders.enterDistrictCity')}
              error={errors.districtCity}
            />
          </View>
        )

      case 2: // Complaint Information
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.complaintInformation')}
            </Text>
            <DropdownPicker
              label={t('fields.typeOfOffence')}
              value={formData.offenceType}
              onValueChange={(value) => handleFieldChange('offenceType', value)}
              items={offenceOptions}
            />
            <FormInput
              label={t('fields.detailedDescriptionRequired')}
              value={formData.description}
              onChangeText={(text) => handleFieldChange('description', text)}
              placeholder={t('placeholders.describeIncidentMin')}
              multiline
              error={errors.description}
            />
          </View>
        )

      case 3: // Accused Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.accusedDetailsOptional')}
            </Text>
            <Text style={styles.sectionNote}>{t('sections.leaveUnknown')}</Text>
            <FormInput
              label={t('common.name')}
              value={formData.accusedName}
              onChangeText={(text) => handleFieldChange('accusedName', text)}
              placeholder={t('placeholders.accusedName')}
            />
            <FormInput
              label={t('common.address')}
              value={formData.accusedAddress}
              onChangeText={(text) => handleFieldChange('accusedAddress', text)}
              placeholder={t('placeholders.accusedAddress')}
              multiline
            />
            <FormInput
              label={t('common.description')}
              value={formData.accusedDescription}
              onChangeText={(text) =>
                handleFieldChange('accusedDescription', text)
              }
              placeholder={t('placeholders.accusedDetails')}
              multiline
            />
          </View>
        )

      case 4: // Witnesses
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.witnessDetailsOptional')}
            </Text>
            {formData.witnesses.length > 0 && (
              <View>
                {formData.witnesses.map((witness, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {t('fields.witness')} {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch({ type: 'REMOVE_WITNESS', payload: index })
                        }
                      >
                        <Text style={styles.removeButton}>
                          {t('common.remove')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <FormInput
                      label={t('common.name')}
                      value={witness.name}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_WITNESS',
                          payload: { index, field: 'name', value: text },
                        })
                      }
                      placeholder={t('placeholders.witnessName')}
                    />
                    <FormInput
                      label={t('fields.contactInformation')}
                      value={witness.contact}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_WITNESS',
                          payload: { index, field: 'contact', value: text },
                        })
                      }
                      placeholder={t('placeholders.witnessContactExtended')}
                    />
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => dispatch({ type: 'ADD_WITNESS' })}
            >
              <Text style={styles.addButtonText}>
                {t('actions.addWitness')}
              </Text>
            </TouchableOpacity>
          </View>
        )

      case 5: // Evidence
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t('sections.evidenceDetailsOptional')}
            </Text>
            {formData.evidence.length > 0 && (
              <View>
                {formData.evidence.map((evidence, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {t('fields.evidence')} {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch({ type: 'REMOVE_EVIDENCE', payload: index })
                        }
                      >
                        <Text style={styles.removeButton}>
                          {t('common.remove')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <FormInput
                      label={t('common.description')}
                      value={evidence.description}
                      onChangeText={(text) =>
                        dispatch({
                          type: 'UPDATE_EVIDENCE',
                          payload: { index, value: text },
                        })
                      }
                      placeholder={t('placeholders.evidenceShort')}
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
              <Text style={styles.addButtonText}>
                {t('actions.addEvidence')}
              </Text>
            </TouchableOpacity>
          </View>
        )

      case 6: // Declaration
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('sections.declaration')}</Text>
            <View style={styles.declarationBox}>
              <Text style={styles.declarationText}>
                {t('app.declarationText')}
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
                {t('fields.declarationAccept')}
              </Text>
            </TouchableOpacity>
            {errors.declaration && (
              <Text style={styles.errorText}>{errors.declaration}</Text>
            )}
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
        stepLabels={steps}
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
            {t('app.back')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>{t('app.reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === steps.length - 1
              ? t('actions.review')
              : t('app.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
})

export default FormScreen
