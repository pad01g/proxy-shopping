import { Text, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';

export default function Page() {
  // const rootPubKey = 
  const [selectedLanguage, setSelectedLanguage] = useState();
  // const selectedLanguage = "java";
  return <View>
    <Picker
      selectedValue={selectedLanguage}
      onValueChange={(itemValue, itemIndex) =>
        setSelectedLanguage(itemValue)
      }>
      <Picker.Item label="Java" value="java" />
      <Picker.Item label="JavaScript" value="js" />
    </Picker>
    <Text>Setting page</Text>
  </View>;
}
