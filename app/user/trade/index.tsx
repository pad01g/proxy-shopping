import { Button, Text, TextInput, View, FlatList } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';

export default function Page() {
  const [traders, setTraders] = useState<string[]>([]);
  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });

  const load = async () => {
    const tradersStr = await AsyncStorage.getItem(`trader-list`)
    if (!tradersStr){
      setTraders([])
    }else{
      setTraders(JSON.parse(tradersStr));
    }

    const privateKey = await AsyncStorage.getItem('private-key')
    if (!privateKey){
      return
    }
    const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;

    // maybe you have other chat request
    ndk.connect().then(async () => {
      const subscription = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#p": [pubKey] });
      subscription.on("event", (event: NDKEvent) => {
        if (!traders.includes(event.pubkey)){
          setTraders([...traders, event.pubkey])
        }
      });
    });
  }
  useEffect(() => {load()}, []);

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Trade list</Text>
    <FlatList
        data={traders}
        renderItem={({item}) => <Link href={{
          pathname: "/user/trade/[id]",
          params: { id: item }
        }}>{item}</Link>}
      />

    <Link href="/">Home</Link>
  </View>;
}
