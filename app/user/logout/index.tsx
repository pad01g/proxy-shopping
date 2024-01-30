import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Redirect } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";

export default function Page() {
  (async () => {
    await AsyncStorage.removeItem('private-key');
    // remove other entries here. but some entries like language settings should be preserved.
    await AsyncStorage.clear();
  })()
  return <Redirect href="/" />;
}
