import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
      <Text>Profile fetched from nostr: </Text>
      <StatusBar style="auto" />
      <Link href="./escrow/community">Admin Chat</Link>
      <Link href="./escrow/tasks">TAsks</Link>
      <Link href="./escrow/trades">Trades</Link>
      <Link href="./escrow/wallet">Wallet</Link>
      <Link href="/">Home</Link>
    </View>
  );
}
