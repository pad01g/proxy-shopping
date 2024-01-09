import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
      <Text>Profile fetched from nostr: </Text>
      <StatusBar style="auto" />
      <Link href="/admin/seller">For Seller</Link>
      <Link href="/admin/ceo">For CEO</Link>
      <Link href="/admin/escrow">For Escrow</Link>
      <Link href="/admin/escrow-manager">For Escrow Manager</Link>
      <Link href="/admin/moderator">For Moderator</Link>
      <Link href="/admin/moderator-manager">For Moderator Manager</Link>
      <Link href="/admin/resource-manager">For Resource Manager</Link>
      <Link href="/">Home</Link>
    </View>
  );
}
