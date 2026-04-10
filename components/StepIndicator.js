import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StepIndicator = ({ currentStep, totalSteps, stepLabels }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {stepLabels.map((label, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                index < currentStep && styles.stepCompleted,
                index === currentStep && styles.stepActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (index < currentStep || index === currentStep) &&
                    styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            {index < stepLabels.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <View style={styles.labelsContainer}>
        {stepLabels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              index === currentStep && styles.stepLabelActive,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  stepCompleted: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  stepActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#4caf50',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    flex: 1,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#2196f3',
    fontWeight: '600',
  },
});

export default StepIndicator;
