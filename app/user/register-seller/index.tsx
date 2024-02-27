import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";
import { defaultMembers } from '../../lib/config';

enum RegisterSellerStatus {
  Registered = "REGISTERED",
  Waiting = "WAITING",
  NotRegistered = "NOT_REGISTERED",
  Rejected = "REJECTED"
}

export default function Page() {

  const [registerSellerStatus, setRegisterSellerStatus] = useState(RegisterSellerStatus.NotRegistered);
  AsyncStorage.getItem('register-seller/status').then((status) => {
    if (status && status in RegisterSellerStatus){
      setRegisterSellerStatus(status as RegisterSellerStatus);
    }
  })

  // Create a new NDK instance with explicit relays
  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });
  ndk.connect().then(async () => {
    if (registerSellerStatus === RegisterSellerStatus.Waiting) {
      const moderators = await AsyncStorage.getItem('register-seller/moderators');
      if (moderators){
        const moderatorsList = JSON.parse(moderators);
        trackSubscriptions(moderatorsList);  
      }
    }
  });

  const trackSubscriptions = (npubs: string[]) => {
    const subscription = ndk.subscribe({ kinds: [NDKKind.GroupChat], authors: npubs });
    // show messages as chat logs in view
    subscription.on("event", (event: NDKEvent) => {
      // update `registerSellerStatus`
    })
    subscription.on("eose", () => {})
  }

  // post direct message to multiple moderators. moderator must be validated by verimod.
  const registerSeller = async () => {
    // get current user account from AsyncStorage
    const privateKey = await AsyncStorage.getItem('private-key');

    // if private key is not generated yet, cancel it.
    if (!privateKey){
      return;
    }
    // convert private key to public key for nostr
    const signer = new NDKPrivateKeySigner(privateKey);
    const user = await signer.user();
    const pubkey = user.pubkey;

    // define PM receiver (in this case, moderators pubkey)
    const moderatorPubkey = (await new NDKPrivateKeySigner(defaultMembers.moderator.privateKey).user()).pubkey;

    // get current verimod status
    // extract moderators list
    // send messages to all moderators

    const nostrEvent: NostrEvent = {
      created_at: Math.floor((new Date()).getTime() / 1000),
      content: "/RegisterSeller I want to register as a seller",
      tags: [["p", moderatorPubkey]],
      kind: NDKKind.GroupChat,
      pubkey: pubkey
    };

    const signature = await signer.sign(nostrEvent);

    nostrEvent.sig = signature;

    const event = new NDKEvent(ndk, nostrEvent);

    // remember which moderators i am referring to
    const moderators = [
      moderatorPubkey
    ];

    // await event.encrypt(
    //   new NDKUser({pubkey: moderatorPubkey}),
    //   signer
    // ).catch(e => {
    //   console.log(e);
    // });

    // @todo check ndk connection status

    // now we have encrypted event, broadcast it to server for registration.
    const publishResult = await event.publish().catch(e => console.log);

    console.log(publishResult);

    const moderatorsNpub = moderators.map(moderator => new NDKUser({pubkey: moderator}).npub )

    await AsyncStorage.setItem('register-seller/moderators', JSON.stringify({moderatorsNpub}));
    await AsyncStorage.setItem('register-seller/status', RegisterSellerStatus.Waiting);

    trackSubscriptions(moderators);
  }

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    {registerSellerStatus === RegisterSellerStatus.NotRegistered?
      <Button title="Register Seller" onPress={registerSeller}/>:
      <>
        <Text>Registration status: {}</Text>
        <Text>Registration chat log:</Text>
      </>
    }
    <Link href="/">Home</Link>
  </View>;
}
