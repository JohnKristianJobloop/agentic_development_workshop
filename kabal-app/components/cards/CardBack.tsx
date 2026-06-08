import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'

type Props = {
  onPress?: () => void
  testID?: string
}

export const CardBack = ({ onPress, testID }: Props) => (
  <Pressable testID={testID} onPress={onPress} disabled={!onPress}>
    <View style={styles.card} />
  </Pressable>
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
