import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
      <Text>Profile fetched from nostr: </Text>
      <StatusBar style="auto" />
      <Link href="./ceo/community">Admin Chat</Link>
      <Link href="./ceo/escrow-status">Escrow Status</Link>
      <Link href="./ceo/moderator-status">Moderator Status</Link>
      <Link href="./ceo/resource-status">Resource Status</Link>
      <Link href="/">Home</Link>
    </View>
  );
}
