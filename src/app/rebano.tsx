import { View, Text, StyleSheet } from 'react-native';

export default function PantallaRebano() {
  return (
    <View style={styles.container}>
      <Text>Herd (Rebaño) - En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
