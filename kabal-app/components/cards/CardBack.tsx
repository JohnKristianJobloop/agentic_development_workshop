import React from 'react'
import { View, StyleSheet } from 'react-native'

export const CardBack = () => (
  <View style={styles.card} />
)

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#2c3e50',
  },
})
