import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import bitcoin from "bitcoinjs-lib"
import { useState } from 'react';

export default function App() {
  const [userPrivateKey, setUserPrivateKey] = useState("");
  (async () => {
    const privateKey = await AsyncStorage.getItem('private-key');
    if (privateKey) {
      setUserPrivateKey(privateKey);
    }
  })();

  return (
    <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
      <StatusBar style="auto" />
      {userPrivateKey ? 
        <>
          <Link href="/user/settings">Settings</Link>
          <Link href="/user/trade">Trade History</Link>
          <Link href="/user/register-seller">Register Seller</Link>
          <Link href="/user/offer-board">Offer board</Link>
          <Link href="/admin">Admin pages</Link>
          <Link href="/user/logout">Logout</Link>
        </> :
        <Link href="/user/signin">Sign In</Link>
      }
    </View>
  );
}
