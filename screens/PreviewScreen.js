import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { generateAndSharePDF, generatePDF } from '../utils/generatePDF';
import { deleteDraft } from '../utils/storage';
import * as Sharing from 'expo-sharing';

const PreviewScreen = ({ formData, onEdit, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateAndShare = async () => {
    try {
      setLoading(true);
      await generateAndSharePDF(formData);
      Alert.alert(
        'Success',
        'PDF generated successfully! Please select how to share it.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const uri = await generatePDF(formData);
      Alert.alert(
        'Success',
        'PDF generated successfully!\n\nFile saved to:\n' + uri
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      Alert.alert(
        'Confirm',
        'Are you sure you want to submit this FIR? This will clear the saved draft.',
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Submit & Clear',
            onPress: async () => {
              await deleteDraft();
              Alert.alert(
                'Complete',
                'FIR submitted successfully! Draft cleared.'
              );
              onBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review FIR</Text>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Complainant Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complainant Details</Text>
          <View style={styles.fieldRow}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{formData.fullName}</Text>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{formData.gender}</Text>
            </View>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{formData.age || 'N/A'}</Text>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{formData.phone}</Text>
            </View>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{formData.address}</Text>
          </View>
          {formData.email && (
            <View style={styles.fieldFull}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{formData.email}</Text>
            </View>
          )}
        </View>

        {/* Incident Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.fieldRow}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(formData.dateOfIncident)}</Text>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{formatTime(formData.timeOfIncident)}</Text>
            </View>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Place</Text>
            <Text style={styles.value}>{formData.placeOfOccurrence}</Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Police Station</Text>
              <Text style={styles.value}>{formData.policeStation}</Text>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>District/City</Text>
              <Text style={styles.value}>{formData.districtCity}</Text>
            </View>
          </View>
        </View>

        {/* Complaint Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complaint Information</Text>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Type of Offence</Text>
            <Text style={styles.value}>{formData.offenceType}</Text>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Description</Text>
            <Text style={[styles.value, styles.multilineValue]}>
              {formData.description}
            </Text>
          </View>
        </View>

        {/* Accused Details */}
        {formData.accusedName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accused Details</Text>
            <View style={styles.fieldFull}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{formData.accusedName}</Text>
            </View>
            {formData.accusedAddress && (
              <View style={styles.fieldFull}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{formData.accusedAddress}</Text>
              </View>
            )}
            {formData.accusedDescription && (
              <View style={styles.fieldFull}>
                <Text style={styles.label}>Description</Text>
                <Text style={[styles.value, styles.multilineValue]}>
                  {formData.accusedDescription}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Witnesses */}
        {formData.witnesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Witnesses ({formData.witnesses.length})
            </Text>
            {formData.witnesses.map((witness, idx) => (
              <View key={idx} style={styles.itemCard}>
                <Text style={styles.itemTitle}>Witness {idx + 1}</Text>
                <View style={styles.fieldFull}>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>{witness.name}</Text>
                </View>
                <View style={styles.fieldFull}>
                  <Text style={styles.label}>Contact</Text>
                  <Text style={styles.value}>{witness.contact}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Evidence */}
        {formData.evidence.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Evidence ({formData.evidence.length})
            </Text>
            {formData.evidence.map((evidence, idx) => (
              <View key={idx} style={styles.itemCard}>
                <Text style={styles.itemTitle}>Evidence {idx + 1}</Text>
                <View style={styles.fieldFull}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={[styles.value, styles.multilineValue]}>
                    {evidence.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={onEdit}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateAndShare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Share PDF</Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2196f3',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fieldItem: {
    flex: 1,
    marginRight: 8,
  },
  fieldFull: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    color: '#333',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  multilineValue: {
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    flex: 0.8,
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PreviewScreen;
