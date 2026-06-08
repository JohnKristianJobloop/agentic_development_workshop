module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|firebase|@firebase/.*)',
  ],
  testMatch: ['**/__specs__/**/*.spec.ts', '**/__specs__/**/*.spec.tsx'],
  setupFilesAfterFramework: ['@testing-library/react-native/extend-expect'],
}
