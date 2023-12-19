import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import bitcoin from "bitcoinjs-lib"
// // Import the package
import NDK from "@nostr-dev-kit/ndk";

const main = async () => {
  // Create a new NDK instance with explicit relays
  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });

  await ndk.connect();

  const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
  });
  await pablo.fetchProfile();

  const pabloFullProfile = pablo.profile;
  console.log(pabloFullProfile);
}

export default function App() {
  main();
  return (
    <View style={styles.container}>
      <Text>Profile fetched from nostr: </Text>
      <StatusBar style="auto" />
      <Link href="/settings">Settings</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
