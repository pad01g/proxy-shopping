import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

export default function Page() {
  const [isModerator, setIsModerator] = useState(false);
  const load = async () => {
    setIsModerator(await AsyncStorage.getItem('is-moderator') == "yes" ?? false);

    // fetch message for me, group by authors
    const privateKey = await AsyncStorage.getItem('private-key')
    if (privateKey){
      const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;

      // Create a new NDK instance with explicit relays
      const ndk = new NDK({
        explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
      });
      ndk.connect().then(async () => {
        const subscription = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#p": [pubKey] });
        subscription.on("event", (event: NDKEvent) => {
          // update `registerSellerStatus`
          console.log(event)
        })
      });
  
      // for each authors, you can check approve or deny.
      // sign the message for approval and broadcast it  
    }
  }
  load();
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    {isModerator ? <>
        <div>
          <p>You are moderator.</p>
          <Link href="/">Home</Link>          
        </div>
      </>:<>
        <Link href="/">Home</Link>
      </>
    }
  </View>;
}
