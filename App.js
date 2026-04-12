import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  generateAndSharePDF,
  generatePDF as generatePDFUtil,
} from './utils/generatePDF'
import {
  LANGUAGE_OPTIONS,
  getCurrentLanguage,
  getDeviceLanguage,
  getOffenceLabel,
  setI18nLanguage,
  t,
} from './i18n'

const FORM_STORAGE_KEY = 'firFormData'
const LANGUAGE_STORAGE_KEY = 'firLanguage'

const OFFENCE_TYPES = ['Theft', 'Assault', 'Fraud', 'Harassment', 'Other']

export default function App() {
  const [screen, setScreen] = useState('form')
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState('en')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [isLanguageOnboarding, setIsLanguageOnboarding] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    address: '',
    phone: '',
    email: '',
    incidentDate: '',
    incidentTime: '',
    place: '',
    policeStation: '',
    district: '',
    offenceType: '',
    description: '',
    accusedName: '',
    accusedAddress: '',
    accusedDesc: '',
    witnesses: [],
    evidence: [],
    declaration: false,
  })

  const [newWitness, setNewWitness] = useState({ name: '', contact: '' })
  const [newEvidence, setNewEvidence] = useState('')

  useEffect(() => {
    initializeApp()
  }, [])

  const loadSavedForm = async () => {
    const saved = await AsyncStorage.getItem(FORM_STORAGE_KEY)
    if (saved) {
      setFormData(JSON.parse(saved))
      Alert.alert(t('alerts.success'), t('alerts.formLoaded'))
    }
  }

  const initializeApp = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      const resolvedLanguage = setI18nLanguage(
        savedLanguage || getDeviceLanguage(),
      )
      setLanguage(resolvedLanguage)

      if (savedLanguage) {
        await loadSavedForm()
      } else {
        setSelectedLanguage(resolvedLanguage)
        setIsLanguageOnboarding(true)
        setShowLanguageModal(true)
      }
    } catch (error) {
      console.error('Error loading app data:', error)
    }
  }

  const handleLanguageSelect = async (lang) => {
    if (isLanguageOnboarding) {
      setSelectedLanguage(lang)
      const resolved = setI18nLanguage(lang)
      setLanguage(resolved)
      return
    }

    const resolved = setI18nLanguage(lang)
    setLanguage(resolved)
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolved)
    setShowLanguageModal(false)
  }

  const continueWithSelectedLanguage = async () => {
    const resolved = setI18nLanguage(selectedLanguage)
    setLanguage(resolved)
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolved)
    setIsLanguageOnboarding(false)
    setShowLanguageModal(false)
    await loadSavedForm()
  }

  const saveForm = async () => {
    try {
      await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
      Alert.alert(t('alerts.success'), t('alerts.formSaved'))
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.failedSave'))
    }
  }

  const resetFormData = {
    name: '',
    gender: '',
    age: '',
    address: '',
    phone: '',
    email: '',
    incidentDate: '',
    incidentTime: '',
    place: '',
    policeStation: '',
    district: '',
    offenceType: '',
    description: '',
    accusedName: '',
    accusedAddress: '',
    accusedDesc: '',
    witnesses: [],
    evidence: [],
    declaration: false,
  }

  const resetForm = () => {
    Alert.alert(t('alerts.resetFormTitle'), t('alerts.resetFormConfirm'), [
      { text: t('common.cancel') },
      {
        text: t('common.yes'),
        onPress: async () => {
          setFormData(resetFormData)
          setStep(1)
          await AsyncStorage.removeItem(FORM_STORAGE_KEY)
        },
      },
    ])
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const addWitness = () => {
    if (!newWitness.name.trim() || !newWitness.contact.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterWitness'))
      return
    }

    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, newWitness],
    })
    setNewWitness({ name: '', contact: '' })
  }

  const removeWitness = (index) => {
    setFormData({
      ...formData,
      witnesses: formData.witnesses.filter((_, i) => i !== index),
    })
  }

  const addEvidence = () => {
    if (!newEvidence.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterEvidence'))
      return
    }

    setFormData({
      ...formData,
      evidence: [...formData.evidence, { description: newEvidence }],
    })
    setNewEvidence('')
  }

  const removeEvidence = (index) => {
    setFormData({
      ...formData,
      evidence: formData.evidence.filter((_, i) => i !== index),
    })
  }

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name.trim() ||
        !formData.phone.trim() ||
        !formData.address.trim()
      ) {
        Alert.alert(t('alerts.error'), t('alerts.fillRequired'))
        return false
      }
      if (!/^\d+$/.test(formData.phone)) {
        Alert.alert(t('alerts.error'), t('alerts.phoneNumbersOnly'))
        return false
      }
    } else if (step === 2) {
      if (
        !formData.place.trim() ||
        !formData.policeStation.trim() ||
        !formData.district.trim()
      ) {
        Alert.alert(t('alerts.error'), t('alerts.fillRequired'))
        return false
      }
    } else if (step === 3) {
      if (!formData.offenceType.trim() || !formData.description.trim()) {
        Alert.alert(t('alerts.error'), t('alerts.fillRequired'))
        return false
      }
    } else if (step === 7) {
      if (!formData.declaration) {
        Alert.alert(t('alerts.error'), t('alerts.acceptDeclaration'))
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      if (step < 7) {
        setStep(step + 1)
      } else {
        setScreen('preview')
      }
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const mapFormDataForPDF = () => {
    return {
      fullName: formData.name,
      gender: formData.gender,
      age: formData.age,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      dateOfIncident: formData.incidentDate,
      timeOfIncident: formData.incidentTime,
      placeOfOccurrence: formData.place,
      policeStation: formData.policeStation,
      districtCity: formData.district,
      offenceType: formData.offenceType,
      description: formData.description,
      accusedName: formData.accusedName,
      accusedAddress: formData.accusedAddress,
      accusedDescription: formData.accusedDesc,
      witnesses: formData.witnesses,
      evidence: formData.evidence,
    }
  }

  const generatePDF = async () => {
    try {
      Alert.alert(t('alerts.success'), t('alerts.pdfSaved'))
      const pdfData = mapFormDataForPDF()
      await generatePDFUtil(pdfData, language)
    } catch (error) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.failedGeneratePdf', { message: error.message }),
      )
    }
  }

  const sharePDF = async () => {
    try {
      Alert.alert(t('app.generating'), t('app.creatingAndSharingPdf'))
      const pdfData = mapFormDataForPDF()
      await generateAndSharePDF(pdfData, language)
    } catch (error) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.failedSharePdf', { message: error.message }),
      )
    }
  }

  const offenceChips = useMemo(() => {
    return OFFENCE_TYPES.map((type) => ({
      value: type,
      label: getOffenceLabel(type),
    }))
  }, [language])

  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find((item) => item.code === getCurrentLanguage())
      ?.label || 'English'

  return (
    <>
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isLanguageOnboarding) {
            setShowLanguageModal(false)
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('app.chooseLanguage')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('app.selectLanguageHint')}
            </Text>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.languageOption,
                  (isLanguageOnboarding ? selectedLanguage : language) ===
                    item.code && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageSelect(item.code)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    (isLanguageOnboarding ? selectedLanguage : language) ===
                      item.code && styles.languageOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {isLanguageOnboarding && (
              <TouchableOpacity
                style={styles.modalContinueButton}
                onPress={continueWithSelectedLanguage}
              >
                <Text style={styles.modalContinueText}>
                  {t('app.continue')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {screen === 'preview' ? (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('app.preview')}</Text>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.languageButtonText}>
                {t('app.language')}: {currentLanguageLabel}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScreen('form')}
            >
              <Text style={styles.buttonText}>{t('app.editForm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
              onPress={generatePDF}
            >
              <Text style={styles.buttonText}>{t('app.savePdf')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#27ae60' }]}
              onPress={sharePDF}
            >
              <Text style={styles.buttonText}>{t('app.share')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>
              {t('sections.complainantDetails')}
            </Text>
            <Text style={styles.previewText}>
              {t('common.name')}: {formData.name || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('common.phone')}: {formData.phone || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('common.address')}: {formData.address || t('common.noData')}
            </Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>
              {t('sections.incidentDetails')}
            </Text>
            <Text style={styles.previewText}>
              {t('common.date')}: {formData.incidentDate || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('common.time')}: {formData.incidentTime || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('fields.place')}: {formData.place || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('fields.policeStation')}:{' '}
              {formData.policeStation || t('common.noData')}
            </Text>
            <Text style={styles.previewText}>
              {t('fields.district')}: {formData.district || t('common.noData')}
            </Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>
              {t('sections.complaintInformation')}
            </Text>
            <Text style={styles.previewText}>
              {t('fields.typeOfOffence')}:{' '}
              {getOffenceLabel(formData.offenceType)}
            </Text>
            <Text style={styles.previewText}>
              {t('common.description')}:{' '}
              {formData.description || t('common.noData')}
            </Text>
          </View>

          {formData.accusedName ? (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>
                {t('sections.accusedDetails')}
              </Text>
              <Text style={styles.previewText}>
                {t('common.name')}: {formData.accusedName}
              </Text>
              <Text style={styles.previewText}>
                {t('common.address')}:{' '}
                {formData.accusedAddress || t('common.noData')}
              </Text>
            </View>
          ) : null}

          {formData.witnesses.length > 0 ? (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>
                {t('sections.witnessesCount', {
                  count: formData.witnesses.length,
                })}
              </Text>
              {formData.witnesses.map((w, i) => (
                <Text key={i} style={styles.previewText}>
                  {i + 1}. {w.name} - {w.contact}
                </Text>
              ))}
            </View>
          ) : null}

          {formData.evidence.length > 0 ? (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>
                {t('sections.evidenceCount', {
                  count: formData.evidence.length,
                })}
              </Text>
              {formData.evidence.map((e, i) => (
                <Text key={i} style={styles.previewText}>
                  {i + 1}. {typeof e === 'string' ? e : e.description}
                </Text>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('app.stepTitle', { step, total: 7 })}
            </Text>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.languageButtonText}>
                {t('app.language')}: {currentLanguageLabel}
              </Text>
            </TouchableOpacity>
          </View>

          {step === 1 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.complainantDetails')}
              </Text>
              <Text style={styles.label}>{t('fields.fullNameRequired')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.enterName')}
                value={formData.name}
                onChangeText={(val) => handleChange('name', val)}
              />
              <Text style={styles.label}>{t('fields.gender')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.genderExample')}
                value={formData.gender}
                onChangeText={(val) => handleChange('gender', val)}
              />
              <Text style={styles.label}>{t('fields.age')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.age')}
                value={formData.age}
                onChangeText={(val) => handleChange('age', val)}
                keyboardType="numeric"
              />
              <Text style={styles.label}>{t('fields.addressRequired')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.enterAddress')}
                value={formData.address}
                onChangeText={(val) => handleChange('address', val)}
                multiline
              />
              <Text style={styles.label}>{t('fields.phoneRequired')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.phone')}
                value={formData.phone}
                onChangeText={(val) => handleChange('phone', val)}
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>{t('fields.emailOptional')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.email')}
                value={formData.email}
                onChangeText={(val) => handleChange('email', val)}
                keyboardType="email-address"
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.incidentDetails')}
              </Text>
              <Text style={styles.label}>{t('fields.dateOfIncident')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.dateExample')}
                value={formData.incidentDate}
                onChangeText={(val) => handleChange('incidentDate', val)}
              />

              <Text style={styles.label}>{t('fields.timeOfIncident')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.timeExample')}
                value={formData.incidentTime}
                onChangeText={(val) => handleChange('incidentTime', val)}
              />

              <Text style={styles.label}>
                {t('fields.placeOfOccurrenceRequired')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.location')}
                value={formData.place}
                onChangeText={(val) => handleChange('place', val)}
              />
              <Text style={styles.label}>
                {t('fields.policeStationRequired')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.stationName')}
                value={formData.policeStation}
                onChangeText={(val) => handleChange('policeStation', val)}
              />
              <Text style={styles.label}>
                {t('fields.districtCityRequired')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.district')}
                value={formData.district}
                onChangeText={(val) => handleChange('district', val)}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.complaintInformation')}
              </Text>
              <Text style={styles.label}>
                {t('fields.typeOfOffenceRequired')}
              </Text>
              <View style={styles.dropdownContainer}>
                {offenceChips.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.dropdownItem,
                      formData.offenceType === type.value &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleChange('offenceType', type.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        formData.offenceType === type.value &&
                          styles.dropdownTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>
                {t('fields.detailedDescriptionRequired')}
              </Text>
              <TextInput
                style={[styles.input, { height: 120 }]}
                placeholder={t('placeholders.describeIncident')}
                value={formData.description}
                onChangeText={(val) => handleChange('description', val)}
                multiline
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.accusedDetailsOptional')}
              </Text>
              <Text style={styles.label}>{t('common.name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.accusedName')}
                value={formData.accusedName}
                onChangeText={(val) => handleChange('accusedName', val)}
              />
              <Text style={styles.label}>{t('common.address')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.accusedAddress')}
                value={formData.accusedAddress}
                onChangeText={(val) => handleChange('accusedAddress', val)}
              />
              <Text style={styles.label}>{t('common.description')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.accusedDetails')}
                value={formData.accusedDesc}
                onChangeText={(val) => handleChange('accusedDesc', val)}
                multiline
              />
            </View>
          )}

          {step === 5 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.witnessDetails')}
              </Text>
              <Text style={styles.label}>{t('fields.witnessName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.witnessName')}
                value={newWitness.name}
                onChangeText={(val) =>
                  setNewWitness({ ...newWitness, name: val })
                }
              />
              <Text style={styles.label}>{t('fields.contactInformation')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.witnessContact')}
                value={newWitness.contact}
                onChangeText={(val) =>
                  setNewWitness({ ...newWitness, contact: val })
                }
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: '#9b59b6', marginBottom: 15 },
                ]}
                onPress={addWitness}
              >
                <Text style={styles.buttonText}>{t('actions.addWitness')}</Text>
              </TouchableOpacity>

              {formData.witnesses.length > 0 && (
                <View>
                  <Text style={[styles.label, { marginTop: 15 }]}>
                    {t('app.addedWitnesses', {
                      count: formData.witnesses.length,
                    })}
                  </Text>
                  {formData.witnesses.map((w, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listText}>
                        {i + 1}. {w.name} - {w.contact}
                      </Text>
                      <TouchableOpacity onPress={() => removeWitness(i)}>
                        <Text style={styles.removeText}>
                          {t('common.remove')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {step === 6 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.evidenceDetails')}
              </Text>
              <Text style={styles.label}>
                {t('fields.evidenceDescriptionOptional')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('placeholders.evidenceInput')}
                value={newEvidence}
                onChangeText={setNewEvidence}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: '#16a085', marginBottom: 15 },
                ]}
                onPress={addEvidence}
              >
                <Text style={styles.buttonText}>
                  {t('actions.addEvidence')}
                </Text>
              </TouchableOpacity>

              {formData.evidence.length > 0 && (
                <View>
                  <Text style={[styles.label, { marginTop: 15 }]}>
                    {t('app.addedEvidence', {
                      count: formData.evidence.length,
                    })}
                  </Text>
                  {formData.evidence.map((e, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listText}>
                        {i + 1}. {typeof e === 'string' ? e : e.description}
                      </Text>
                      <TouchableOpacity onPress={() => removeEvidence(i)}>
                        <Text style={styles.removeText}>
                          {t('common.remove')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {step === 7 && (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>
                {t('sections.declaration')}
              </Text>
              <View style={styles.declarationBox}>
                <Text style={styles.declarationText}>
                  {t('app.declarationText')}
                </Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={formData.declaration}
                    onValueChange={(val) => handleChange('declaration', val)}
                  />
                  <Text style={styles.switchLabel}>{t('app.iAccept')}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.button} onPress={prevStep}>
                <Text style={styles.buttonText}>{t('app.back')}</Text>
              </TouchableOpacity>
            )}
            {step < 7 && (
              <TouchableOpacity style={styles.button} onPress={nextStep}>
                <Text style={styles.buttonText}>{t('app.next')}</Text>
              </TouchableOpacity>
            )}
            {step === 7 && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#27ae60' }]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>
                  {t('app.previewGeneratePdf')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f39c12' }]}
              onPress={saveForm}
            >
              <Text style={styles.buttonText}>{t('app.saveProgress')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>{t('app.reset')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 300 }} />
        </ScrollView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: {
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#34495e',
    marginTop: 10,
  },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#2c3e50' },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 11,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 13,
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownItemSelected: { backgroundColor: '#3498db' },
  dropdownText: { color: '#3498db', fontWeight: '600', fontSize: 12 },
  dropdownTextSelected: { color: '#fff' },
  listItem: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listText: { flex: 1, color: '#2c3e50', fontSize: 13 },
  removeText: { color: '#e74c3c', fontWeight: '700' },
  declarationBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginBottom: 20,
  },
  declarationText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 15,
    fontWeight: '500',
  },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  previewSection: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  previewText: { fontSize: 13, color: '#2c3e50', marginBottom: 5 },
  languageButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#ecf5ff',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  languageButtonText: { color: '#1f4f79', fontWeight: '600', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2c3e50' },
  modalSubtitle: {
    marginTop: 8,
    marginBottom: 14,
    fontSize: 13,
    color: '#6c7a89',
  },
  languageOption: {
    borderWidth: 1,
    borderColor: '#d6e6f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  languageOptionActive: { borderColor: '#3498db', backgroundColor: '#ebf5ff' },
  languageOptionText: { color: '#2c3e50', fontSize: 15, fontWeight: '600' },
  languageOptionTextActive: { color: '#206aa7' },
  modalContinueButton: {
    marginTop: 6,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalContinueText: { color: '#fff', fontSize: 14, fontWeight: '700' },
})
