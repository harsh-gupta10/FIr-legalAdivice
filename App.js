import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAndSharePDF, generatePDF as generatePDFUtil } from './utils/generatePDF';

const OFFENCE_TYPES = ['Theft', 'Assault', 'Fraud', 'Harassment', 'Other'];

export default function App() {
  const [screen, setScreen] = useState('form'); // 'form' or 'preview'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Complainant
    name: '',
    gender: '',
    age: '',
    address: '',
    phone: '',
    email: '',
    // Incident
    incidentDate: '',
    incidentTime: '',
    place: '',
    policeStation: '',
    district: '',
    // Complaint
    offenceType: '',
    description: '',
    // Accused (optional)
    accusedName: '',
    accusedAddress: '',
    accusedDesc: '',
    // Witnesses (can be multiple)
    witnesses: [],
    // Evidence (can be multiple)
    evidence: [],
    // Declaration
    declaration: false,
  });

  const [newWitness, setNewWitness] = useState({ name: '', contact: '' });
  const [newEvidence, setNewEvidence] = useState('');

  // Load form from AsyncStorage on mount
  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    try {
      const saved = await AsyncStorage.getItem('firFormData');
      if (saved) {
        setFormData(JSON.parse(saved));
        Alert.alert('Success', 'Form data loaded from storage');
      }
    } catch (error) {
      console.error('Error loading form:', error);
    }
  };

  const saveForm = async () => {
    try {
      await AsyncStorage.setItem('firFormData', JSON.stringify(formData));
      Alert.alert('Success', 'Form saved locally');
    } catch (error) {
      Alert.alert('Error', 'Failed to save form');
    }
  };

  const resetForm = () => {
    Alert.alert('Reset Form', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Yes',
        onPress: () => {
          setFormData({
            name: '', gender: '', age: '', address: '', phone: '', email: '',
            incidentDate: '', incidentTime: '', place: '', policeStation: '', district: '',
            offenceType: '', description: '',
            accusedName: '', accusedAddress: '', accusedDesc: '',
            witnesses: [], evidence: [], declaration: false,
          });
          setStep(1);
          AsyncStorage.removeItem('firFormData');
        },
      },
    ]);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addWitness = () => {
    if (!newWitness.name.trim() || !newWitness.contact.trim()) {
      Alert.alert('Error', 'Enter witness name and contact');
      return;
    }
    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, newWitness],
    });
    setNewWitness({ name: '', contact: '' });
  };

  const removeWitness = (index) => {
    setFormData({
      ...formData,
      witnesses: formData.witnesses.filter((_, i) => i !== index),
    });
  };

  const addEvidence = () => {
    if (!newEvidence.trim()) {
      Alert.alert('Error', 'Enter evidence description');
      return;
    }
    setFormData({
      ...formData,
      evidence: [...formData.evidence, newEvidence],
    });
    setNewEvidence('');
  };

  const removeEvidence = (index) => {
    setFormData({
      ...formData,
      evidence: formData.evidence.filter((_, i) => i !== index),
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
        Alert.alert('Error', 'Please fill all required fields');
        return false;
      }
      if (!/^\d+$/.test(formData.phone)) {
        Alert.alert('Error', 'Phone must contain only numbers');
        return false;
      }
    } else if (step === 2) {
      if (!formData.place.trim() || !formData.policeStation.trim() || !formData.district.trim()) {
        Alert.alert('Error', 'Please fill all required fields');
        return false;
      }
    } else if (step === 3) {
      if (!formData.offenceType.trim() || !formData.description.trim()) {
        Alert.alert('Error', 'Please fill all required fields');
        return false;
      }
    } else if (step === 7) {
      if (!formData.declaration) {
        Alert.alert('Error', 'Please accept the declaration to proceed');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (step < 7) {
        setStep(step + 1);
      } else {
        setScreen('preview');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

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
    };
  };

  const generatePDF = async () => {
    try {
      Alert.alert('Success', 'PDF generated and saved to device');
      const pdfData = mapFormDataForPDF();
      await generatePDFUtil(pdfData);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
    }
  };

  const sharePDF = async () => {
    try {
      Alert.alert('Generating', 'Creating and sharing PDF...');
      const pdfData = mapFormDataForPDF();
      await generateAndSharePDF(pdfData);
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF: ' + error.message);
    }
  };

  if (screen === 'preview') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>FIR Preview</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('form')}>
            <Text style={styles.buttonText}>← Edit Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={generatePDF}>
            <Text style={styles.buttonText}>� Save PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]} onPress={sharePDF}>
            <Text style={styles.buttonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Complainant Details</Text>
          <Text style={styles.previewText}>Name: {formData.name}</Text>
          <Text style={styles.previewText}>Phone: {formData.phone}</Text>
          <Text style={styles.previewText}>Address: {formData.address}</Text>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <Text style={styles.previewText}>Date: {formData.incidentDate}</Text>
          <Text style={styles.previewText}>Time: {formData.incidentTime}</Text>
          <Text style={styles.previewText}>Place: {formData.place}</Text>
          <Text style={styles.previewText}>Police Station: {formData.policeStation}</Text>
          <Text style={styles.previewText}>District: {formData.district}</Text>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Complaint Information</Text>
          <Text style={styles.previewText}>Offence Type: {formData.offenceType}</Text>
          <Text style={styles.previewText}>Description: {formData.description}</Text>
        </View>

        {formData.accusedName && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Accused Details</Text>
            <Text style={styles.previewText}>Name: {formData.accusedName}</Text>
            <Text style={styles.previewText}>Address: {formData.accusedAddress}</Text>
          </View>
        )}

        {formData.witnesses.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Witnesses ({formData.witnesses.length})</Text>
            {formData.witnesses.map((w, i) => (
              <Text key={i} style={styles.previewText}>{i + 1}. {w.name} - {w.contact}</Text>
            ))}
          </View>
        )}

        {formData.evidence.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Evidence ({formData.evidence.length})</Text>
            {formData.evidence.map((e, i) => (
              <Text key={i} style={styles.previewText}>{i + 1}. {e}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FIR Form - Step {step}/7</Text>
      </View>

      {/* STEP 1: Complainant Details */}
      {step === 1 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Complainant Details</Text>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Enter name" value={formData.name} onChangeText={(val) => handleChange('name', val)} />
          <Text style={styles.label}>Gender</Text>
          <TextInput style={styles.input} placeholder="Male/Female/Other" value={formData.gender} onChangeText={(val) => handleChange('gender', val)} />
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} placeholder="Age" value={formData.age} onChangeText={(val) => handleChange('age', val)} keyboardType="numeric" />
          <Text style={styles.label}>Address *</Text>
          <TextInput style={styles.input} placeholder="Enter address" value={formData.address} onChangeText={(val) => handleChange('address', val)} multiline />
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput style={styles.input} placeholder="Phone" value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" />
        </View>
      )}

      {/* STEP 2: Incident Details */}
      {step === 2 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <Text style={styles.label}>Date of Incident</Text>
          <TextInput style={styles.input} placeholder="e.g. 2025-04-06" value={formData.incidentDate} onChangeText={(val) => handleChange('incidentDate', val)} />

          <Text style={styles.label}>Time of Incident</Text>
          <TextInput style={styles.input} placeholder="e.g. 14:30" value={formData.incidentTime} onChangeText={(val) => handleChange('incidentTime', val)} />

          <Text style={styles.label}>Place of Occurrence *</Text>
          <TextInput style={styles.input} placeholder="Location" value={formData.place} onChangeText={(val) => handleChange('place', val)} />
          <Text style={styles.label}>Police Station *</Text>
          <TextInput style={styles.input} placeholder="Station name" value={formData.policeStation} onChangeText={(val) => handleChange('policeStation', val)} />
          <Text style={styles.label}>District/City *</Text>
          <TextInput style={styles.input} placeholder="District" value={formData.district} onChangeText={(val) => handleChange('district', val)} />
        </View>
      )}

      {/* STEP 3: Complaint Information */}
      {step === 3 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Complaint Information</Text>
          <Text style={styles.label}>Type of Offence *</Text>
          <View style={styles.dropdownContainer}>
            {OFFENCE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.dropdownItem, formData.offenceType === type && styles.dropdownItemSelected]}
                onPress={() => handleChange('offenceType', type)}
              >
                <Text style={[styles.dropdownText, formData.offenceType === type && styles.dropdownTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Detailed Description *</Text>
          <TextInput style={[styles.input, { height: 120 }]} placeholder="Describe the incident in detail" value={formData.description} onChangeText={(val) => handleChange('description', val)} multiline />
        </View>
      )}

      {/* STEP 4: Accused Details */}
      {step === 4 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Accused Details (Optional)</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} placeholder="Accused name" value={formData.accusedName} onChangeText={(val) => handleChange('accusedName', val)} />
          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} placeholder="Accused address" value={formData.accusedAddress} onChangeText={(val) => handleChange('accusedAddress', val)} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} placeholder="Physical description/details" value={formData.accusedDesc} onChangeText={(val) => handleChange('accusedDesc', val)} multiline />
        </View>
      )}

      {/* STEP 5: Witness Details */}
      {step === 5 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Witness Details</Text>
          <Text style={styles.label}>Witness Name</Text>
          <TextInput style={styles.input} placeholder="Name" value={newWitness.name} onChangeText={(val) => setNewWitness({ ...newWitness, name: val })} />
          <Text style={styles.label}>Contact Information</Text>
          <TextInput style={styles.input} placeholder="Phone/Email" value={newWitness.contact} onChangeText={(val) => setNewWitness({ ...newWitness, contact: val })} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#9b59b6', marginBottom: 15 }]} onPress={addWitness}>
            <Text style={styles.buttonText}>+ Add Witness</Text>
          </TouchableOpacity>

          {formData.witnesses.length > 0 && (
            <View>
              <Text style={[styles.label, { marginTop: 15 }]}>Added Witnesses: {formData.witnesses.length}</Text>
              {formData.witnesses.map((w, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listText}>{i + 1}. {w.name} - {w.contact}</Text>
                  <TouchableOpacity onPress={() => removeWitness(i)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* STEP 6: Evidence Details */}
      {step === 6 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Evidence Details</Text>
          <Text style={styles.label}>Evidence Description or Link of Proof (Optional)</Text>
          <TextInput style={styles.input} placeholder="Describe the evidence or enter link to proof (optional)" value={newEvidence} onChangeText={setNewEvidence} multiline />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#16a085', marginBottom: 15 }]} onPress={addEvidence}>
            <Text style={styles.buttonText}>+ Add Evidence</Text>
          </TouchableOpacity>

          {formData.evidence.length > 0 && (
            <View>
              <Text style={[styles.label, { marginTop: 15 }]}>Added Evidence: {formData.evidence.length}</Text>
              {formData.evidence.map((e, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listText}>{i + 1}. {e}</Text>
                  <TouchableOpacity onPress={() => removeEvidence(i)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* STEP 7: Declaration */}
      {step === 7 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Declaration</Text>
          <View style={styles.declarationBox}>
            <Text style={styles.declarationText}>I hereby declare that the information provided is true to the best of my knowledge.</Text>
            <View style={styles.switchContainer}>
              <Switch value={formData.declaration} onValueChange={(val) => handleChange('declaration', val)} />
              <Text style={styles.switchLabel}>I accept</Text>
            </View>
          </View>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.button} onPress={prevStep}>
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>
        )}
        {step < 7 && (
          <TouchableOpacity style={styles.button} onPress={nextStep}>
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        )}
        {step === 7 && (
          <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]} onPress={nextStep}>
            <Text style={styles.buttonText}>Preview & Generate PDF</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Save & Reset Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#f39c12' }]} onPress={saveForm}>
          <Text style={styles.buttonText}>💾 Save Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={resetForm}>
          <Text style={styles.buttonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 300 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { marginBottom: 20, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: '#3498db' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#34495e', marginTop: 10 },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#2c3e50' },
  input: { borderWidth: 1, borderColor: '#bdc3c7', padding: 11, marginBottom: 12, borderRadius: 5, backgroundColor: '#fff', fontSize: 13 },
  pickerButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 5, marginBottom: 12, alignItems: 'center' },
  pickerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  dropdownContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 8 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#3498db', borderRadius: 5, backgroundColor: '#fff' },
  dropdownItemSelected: { backgroundColor: '#3498db' },
  dropdownText: { color: '#3498db', fontWeight: '600', fontSize: 12 },
  dropdownTextSelected: { color: '#fff' },
  listItem: { backgroundColor: '#ecf0f1', padding: 10, marginBottom: 8, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between' },
  listText: { flex: 1, color: '#2c3e50', fontSize: 13 },
  removeText: { color: '#e74c3c', fontWeight: '700' },
  declarationBox: { backgroundColor: '#fff', padding: 15, borderRadius: 5, borderWidth: 1, borderColor: '#bdc3c7', marginBottom: 20 },
  declarationText: { fontSize: 14, color: '#2c3e50', marginBottom: 15, fontWeight: '500' },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  buttonContainer: { flexDirection: 'row', gap: 8, marginTop: 15, marginBottom: 15 },
  button: { flex: 1, backgroundColor: '#3498db', padding: 12, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  previewSection: { backgroundColor: '#fff', padding: 12, marginBottom: 12, borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#3498db' },
  previewText: { fontSize: 13, color: '#2c3e50', marginBottom: 5 },
});
