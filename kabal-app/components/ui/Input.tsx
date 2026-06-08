import React from 'react'
import { TextInput, StyleSheet, TextInputProps } from 'react-native'

type Props = TextInputProps & {
  placeholder: string
}

export const Input = ({ placeholder, ...rest }: Props) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    placeholderTextColor="#888"
    autoCapitalize="none"
    {...rest}
  />
)

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1e1e1e',
    backgroundColor: '#fff',
  },
})
