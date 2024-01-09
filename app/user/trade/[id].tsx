import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useLocalSearchParams } from 'expo-router';

export default function Route() {
	const { id } = useLocalSearchParams();
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Trade {id}</Text>
    <Button title="Message"/>

    <Link href="/">Home</Link>
  </View>;
}
