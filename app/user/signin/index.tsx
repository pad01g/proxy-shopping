import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";

export default function Page() {
  const [userInputPrivateKey, setUserInputPrivateKey] = useState("");
  const [userPrivateKey, setUserPrivateKey] = useState("");
  const [userPublicKey, setUserPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const registerUser = async () => {
    // get current user account from AsyncStorage
    // if private key is already generated, cancel it.
    if (await AsyncStorage.getItem('private-key')){
      return;
    }
    // convert private key to public key for nostr
    const signer = NDKPrivateKeySigner.generate();
    const privateKey = signer.privateKey;
    const user = await signer.user();
    const pubkey = user.pubkey;

    if (privateKey){
        await AsyncStorage.setItem('private-key', privateKey)
        setUserPrivateKey(privateKey);
        setUserPublicKey(pubkey);
        setMessage(`User successfully generated. Please backup private key.`);
    }else{
        setMessage(`User registration failed.`);
    }
  }

  const loginUser = async () => {
    // check if userInputPrivateKey is private key format
    const signer = new NDKPrivateKeySigner(userInputPrivateKey);
    const privateKey = signer.privateKey;
    if (privateKey) {
      const user = await signer.user();
      const pubkey = user.pubkey;  
      await AsyncStorage.setItem('private-key', privateKey)
      setUserPrivateKey(privateKey);
      setUserPublicKey(pubkey);
      setMessage(`User successfully logged in.`);
  }else{
      setMessage(`User login failed.`);
  }
  }

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>

    {userPrivateKey ? <>
        <Text>Your private key: {userPrivateKey}</Text>
        <Text>Your public key: {userPublicKey}</Text>
      </>:
      <>
        <Button title="Register User" onPress={registerUser}/>
        <Text>...or, enter your own key:</Text>
        <TextInput style={{ borderBottomWidth : 1.0}} onChangeText={(t) => setUserInputPrivateKey(t)}/>
        <Button title="Login" onPress={loginUser}/>
      </>
    }
    {message ? <Text>Message: {message}</Text> : <></> }
    <Link href="/">Home</Link>
  </View>;
}
