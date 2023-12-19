import { Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Page() {
  // const rootPubKey = 
  const [selectedLanguage, setSelectedLanguage] = useState("");
  // const selectedLanguage = "java";
  return <View>
    <Text>Setting page</Text>
    <Text>Preset:</Text>
    <Picker
      selectedValue={selectedLanguage}
      onValueChange={async (itemValue, itemIndex) => {
        setSelectedLanguage(itemValue)
        try {
          await AsyncStorage.setItem('my-key', selectedLanguage);
        } catch (e) {
          // saving error
        }
      }}>
      <Picker.Item label="Java" value="java" />
      <Picker.Item label="JavaScript" value="js" />
    </Picker>
    <Text>Enter your own key:</Text>
    <TextInput/>
  </View>;
}
