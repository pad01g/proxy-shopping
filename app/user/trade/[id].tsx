import { Button, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useLocalSearchParams } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { decryptPolyfill, encryptPolyfill } from '../../lib';

export default function Route() {
	const { id } = useLocalSearchParams();
  const recipientPubKey: string = `${id}`;
  const [messageQueue, setMessageQueue] = useState<NostrEvent[]>([]);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [messageTextInput, setMessageTextInput] = useState("");
  const [showEscrowHelpOptions, setShowEscrowHelpOptions] = useState(false);
  const [escrowHelpTextInput, setEscrowHelpTextInput] = useState("");

  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });

  const loadMessage = async () => {
    const messageHistory = await AsyncStorage.getItem(`trade-message-${recipientPubKey}`);
    const messageHistoryList: NostrEvent[] = messageHistory ? JSON.parse(messageHistory) : [];
    // remove duplicate message
    const unique = messageHistoryList.reduce((prev, curr) => ({...prev, [curr.id ?? ""]: curr}), {})
    const filtered = Object.values<NostrEvent>(unique).filter(message => message.id).sort((a,b) => a.created_at - b.created_at)
    console.log({filtered})
    setMessageQueue(filtered);
  }

  const load = async () => {
    // fetch message for me, group by authors
    const privateKey = await AsyncStorage.getItem('private-key')
    if (!privateKey){
      return
    }
    const myPubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;
    await loadMessage();

    console.log({myPubKey, messageQueue})

    ndk.connect().then(async () => {
      const subscription = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#p": [myPubKey] });
      console.log(`try subscription`);
      subscription.on("event", async (event: NDKEvent) => {
        // if event is from recipient, then decrypt and search for message.
        // if no similar event exists in history, append to queue

        const eventTargetTag = event.tags?.find(tag => tag[0] === "p")
        if (!eventTargetTag){
          return
        }
        if (eventTargetTag.length <= 1){
          return
        }
        const eventTargetTagPubKey = eventTargetTag[1];

        if (eventTargetTagPubKey === myPubKey && event.pubkey === recipientPubKey){
          // decrypt
          let decrypted: NostrEvent;
          try {
            const content = await decryptPolyfill(privateKey, recipientPubKey, event.content);
            decrypted = JSON.parse(content);
          }catch(e){
            console.log(`json parse failed`)
            return;
          }

          // it already has message
          const idList = messageQueue.map(message => message.id)
          if (idList.includes(decrypted.id)){
            return
          }

          setMessageQueue(queue => {
            return ([...new Set([
              ...queue,
              decrypted
            ])]).sort((a,b) => a.created_at - b.created_at)
          });
        }
      })
    })
  };
  useEffect(() => {load()}, []);

  const submitMessage = async () => {
    const privateKey = await AsyncStorage.getItem('private-key')
    if (!privateKey){
      return
    }
    const signer = new NDKPrivateKeySigner(privateKey);
    const myPubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;

    // @todo latest message id
    const targetId = ""
    // write message `messageTextInput` to `recipientPubKey`
    const nostrEvent: NostrEvent = {
      created_at: Math.floor((new Date()).getTime() / 1000),
      content: messageTextInput,
      tags: [["p", recipientPubKey], ["e", targetId]],
      kind: NDKKind.GroupChat,
      pubkey: myPubKey
    };

    // make a signed nostr message.
    const signature = await signer.sign(nostrEvent);
    nostrEvent.sig = signature;
    ndk.connect().then(async () => {

      // encrypt signed message.
      const event = new NDKEvent(ndk, nostrEvent);
      const messageObject = await event.toNostrEvent();
      const message = JSON.stringify(messageObject);
      console.log({message})
      const content = await encryptPolyfill(privateKey, recipientPubKey, message);

      // swap content with signed-and-encrypted message
      event.content = content;

      // finally, sign message
      const sig = await event.sign(signer);
      event.sig = sig;

      // hide options now
      setShowAppOptions(false);
      setMessageTextInput("");

      const publishResult = await event.publish();
      console.log({publishResult, event});

      // now, save original message in local cache.
      const messageHistory = await AsyncStorage.getItem(`trade-message-${recipientPubKey}`)
      const messageHistoryList: NostrEvent[] = messageHistory ? JSON.parse(messageHistory) : [];
      messageHistoryList.push(messageObject);
      await AsyncStorage.setItem(`trade-message-${recipientPubKey}`, JSON.stringify(messageHistoryList));

      // reload
      setMessageQueue(queue => {
        return ([
          ...queue,
          messageObject
        ])
      });
    });
  }

  const submitEscrowHelpMessage = async () => {}

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Trade with user {id}</Text>
    <div>
      {messageQueue.filter(message => message.id).map((message) => {
        return <div key={message.id + "-" + message.created_at}>
          <p>{message.content}</p>
        </div>
      })}
    </div>
    {showAppOptions ? (
      <View>
        <TextInput
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => setMessageTextInput(text)}
          value={messageTextInput}
        />

        <Button title="Submit" onPress={submitMessage} />
        <Button title="Cancel" onPress={() => setShowAppOptions(false)} />
      </View>
    ) : (
      <Button title="Message" onPress={() => setShowAppOptions(true)}/>
    )}
    {showEscrowHelpOptions ? (
      <View>
        <TextInput
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => setEscrowHelpTextInput(text)}
          value={messageTextInput}
        />

        <Button title="Submit" onPress={submitEscrowHelpMessage} />
        <Button title="Cancel" onPress={() => setShowEscrowHelpOptions(false)} />
      </View>
    ) : (
      <Button title="Dispute" onPress={() => setShowEscrowHelpOptions(true)}/>
    )}
    <Link href="/">Home</Link>
  </View>;
}
