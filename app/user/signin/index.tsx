import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";
import { defaultMembers } from '../../lib/config';
 
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

  const loginUser = async (inputKey?: string) => {
    // check if userInputPrivateKey is private key format
    const signer = new NDKPrivateKeySigner(inputKey ?? userInputPrivateKey);
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

  const loginAsNormalUser = async () => {
    const inputKey = defaultMembers.normalUser.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
  }
  const loginAsModerator = async () => {
    const inputKey = defaultMembers.moderator.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-moderator', "yes")
  }
  const loginAsModeratorManager = async () => {
    const inputKey = defaultMembers.moderatorManager.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-moderator-manager', "yes")
  }
  const loginAsEscrow = async () => {
    const inputKey = defaultMembers.escrow.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-escrow', "yes")
  }
  const loginAsEscrowManager = async () => {
    const inputKey = defaultMembers.escrowManager.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-escrow-manager', "yes")
  }
  const loginAsResourceManager = async () => {
    const inputKey = defaultMembers.resourceManager.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-resource-manager', "yes")
  }
  const loginAsSeller = async () => {
    const inputKey = defaultMembers.seller.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-seller', "yes")
    await AsyncStorage.setItem('register-seller/certificate', defaultMembers.seller.cert);
  }
  const loginAsCeo = async () => {
    const inputKey = defaultMembers.ceo.privateKey;
    setUserInputPrivateKey(inputKey);
    await loginUser(inputKey);
    await AsyncStorage.setItem('is-ceo', "yes")
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
        <Button title="Login" onPress={() => loginUser()}/>
        <Button title="[Debug] Login as Normal User" onPress={loginAsNormalUser}/>
        <Button title="[Debug] Login as Moderator" onPress={loginAsModerator}/>
        <Button title="[Debug] Login as Moderator Manager" onPress={loginAsModeratorManager}/>
        <Button title="[Debug] Login as Escrow" onPress={loginAsEscrow}/>
        <Button title="[Debug] Login as Escrow Manager" onPress={loginAsEscrowManager}/>
        <Button title="[Debug] Login as Resource Manager" onPress={loginAsResourceManager}/>
        <Button title="[Debug] Login as Seller" onPress={loginAsSeller}/>
        <Button title="[Debug] Login as CEO" onPress={loginAsCeo}/>
      </>
    }
    {message ? <Text>Message: {message}</Text> : <></> }
    <Link href="/">Home</Link>
  </View>;
}
