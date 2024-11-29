import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Bạn muốn ăn gì..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default SearchBar;
