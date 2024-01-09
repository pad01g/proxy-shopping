import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
      <Link href="./moderator-manager/community">Admin Chat</Link>
      <Link href="./moderator-manager/reports">Reports</Link>
      <Link href="/">Home</Link>
    </View>
  );
}
