import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

export default function Page() {
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Offer board list</Text>
    <Button title="Add Offer"/>

    <Link href="/">Home</Link>
  </View>;
}
