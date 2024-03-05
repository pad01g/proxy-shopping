import { Button, Text, TextInput, View, StyleSheet } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

export default function Page() {
  // load message from nostr stream
  const [isSeller, setIsSeller] = useState(false);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [offerTextInput, setOfferTextInput] = useState("");

  const styles = StyleSheet.create({
    circleButtonContainer: {
      width: 84,
      height: 84,
      marginHorizontal: 60,
      borderWidth: 4,
      borderColor: '#ffd33d',
      borderRadius: 42,
      padding: 3,
    },
    circleButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 42,
      backgroundColor: '#fff',
    },
  });

  const load = async () => {
    // if user is seller, show button
    setIsSeller(await AsyncStorage.getItem('is-seller') == "yes" ?? false);
    console.log(`isSeller: ${isSeller}`)
  };

  const addOffer = async () => {
    console.log(`clicked addOffer`)
    // show modal so that seller can now add ads
    setShowAppOptions(true)
  }

  const submitAd = async () => {
    console.log(`clicked submitAd`)
    // create nostr stream with some tags.
    setShowAppOptions(false)
  }

  useEffect(() => {load()}, []);

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Offer board list</Text>
    {
      isSeller ?
      <Button title="Add Offer" onPress={addOffer}/>
      : <></>
    }
    <Link href="/">Home</Link>
    {showAppOptions ? (
      <View style={styles.footerContainer}>
        <TextInput
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => setOfferTextInput(text)}
          value={offerTextInput}
        />

        <Button title="Submit my ad" theme="primary" onPress={submitAd} />
        <Button title="Cancel" theme="secondary" onPress={() => setShowAppOptions(false)} />
      </View>
    ) : (
      <View />
    )}
  </View>;
}
