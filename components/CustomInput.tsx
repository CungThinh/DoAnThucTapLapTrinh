// components/CustomInput.tsx
import { StyleSheet, TextInput, Text, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

interface CustomInputProps {
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
  label?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

const CustomInput = ({ 
  value, 
  setValue, 
  placeholder, 
  label,
  secureTextEntry,
  autoCapitalize,
  keyboardType = 'default'
}: CustomInputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
  }
});

export default CustomInput;