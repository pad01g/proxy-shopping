import { Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

export default function Page() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedRootPubkey, setSelectedRootPubkey] = useState("");
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Setting page</Text>
    <Picker
      selectedValue={selectedLanguage}
      onValueChange={async (itemValue, itemIndex) => {
        setSelectedLanguage(itemValue)
        try {
          await AsyncStorage.setItem('language', selectedLanguage);
        } catch (e) {
          // saving error
        }
      }}>
      <Picker.Item label="English" value="english" />
      <Picker.Item label="日本語" value="japanese" />
    </Picker>

    <Text>Root pubkey Preset:</Text>
    <Picker
      selectedValue={selectedRootPubkey}
      onValueChange={async (itemValue, itemIndex) => {
        setSelectedRootPubkey(itemValue)
        try {
          await AsyncStorage.setItem('root-pubkey', selectedRootPubkey);
        } catch (e) {
          // saving error
        }
      }}>
      <Picker.Item label="Default" value="0x1234....abcd" />
    </Picker>
    <Text>Enter your own key:</Text>
    <TextInput style={{ borderBottomWidth : 1.0}}/>
    <Text>Relay:</Text>
    <Text>Sync Status:</Text>

    <Link href="/">Home</Link>

  </View>;
}
