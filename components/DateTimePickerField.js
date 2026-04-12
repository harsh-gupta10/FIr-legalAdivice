import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { getCurrentLanguage, getLocaleTag, t } from '../i18n'

const DateTimePickerField = ({
  label,
  value,
  onChangeDate,
  onChangeTime,
  mode = 'date',
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [pickerMode, setPickerMode] = useState(mode)

  const handleChange = (event, selectedValue) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }

    if (selectedValue) {
      if (mode === 'date') {
        onChangeDate(selectedValue)
      } else {
        onChangeTime(selectedValue)
      }
    }
  }

  const formatDisplay = () => {
    const localeTag = getLocaleTag(getCurrentLanguage())
    if (!value)
      return mode === 'date'
        ? t('placeholders.selectDate')
        : t('placeholders.selectTime')
    return (
      value.toLocaleDateString(localeTag) +
      (mode === 'time'
        ? ' ' +
          value.toLocaleTimeString(localeTag, {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '')
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, error && styles.buttonError]}
        onPress={() => {
          setShowPicker(true)
          setPickerMode(mode)
        }}
      >
        <Text style={styles.buttonText}>{formatDisplay()}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          timeZoneOffsetInMinutes={-330}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosButtonContainer}>
          <TouchableOpacity onPress={() => setShowPicker(false)}>
            <Text style={styles.iosButton}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  buttonError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  iosButtonContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  iosButton: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: '600',
  },
})

export default DateTimePickerField
