import { Button, Text, TextInput, View, StyleSheet } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NostrEvent } from '@nostr-dev-kit/ndk';
// import { generatePrivateKey, getPublicKey, getSignature, nip04 } from "nostr-tools";
import { encryptPolyfill } from '../../lib/nip04';

export default function Page() {
  // load message from nostr stream
  const [isSeller, setIsSeller] = useState(false);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [offerTextInput, setOfferTextInput] = useState("");
  const [offerObjects, setOfferObjects] = useState<{[key:string]: any}>({});

  const [showContactOptions, setShowContactOptions] = useState(false);
  const [contactTextInput, setContactTextInput] = useState("");

  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportTextInput, setReportTextInput] = useState("");

  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });

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
    setIsSeller(await AsyncStorage.getItem('is-seller') === "yes" ?? false);
    console.log(`isSeller: ${isSeller}`)
    // load contents using OfferBoard tag

    ndk.connect().then(async () => {
      const subscriptionToEvent = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#t": ["OfferBoard"] });
      subscriptionToEvent.on("event", async (event: NDKEvent) => {
        console.log(`found some offer: ${event.id}, ${event.pubkey}`);
        // moderator accepted or rejected event
        // @todo check if event message has moderator certificate

        // update offer objects to the latest
        setOfferObjects(q => {
          if (q[event.pubkey]){
            // already exists, check if we should update
            if (q[event.pubkey].created_at < (event.created_at ?? 0)){
              return ({...q, [event.pubkey]: event})
            }else{
              return q;
            }
          }else{
            // add new offer to object
            return ({...q, [event.pubkey]: event})
          }
        })
      });
    });
  };

  const addOffer = async () => {
    console.log(`clicked addOffer`)
    // show modal so that seller can now add ads
    setShowAppOptions(true)
  }

  const submitAd = async () => {
    console.log(`clicked submitAd`)
    // create nostr stream with OfferBoard tag.
    const makeMessage = async ( message: string) => {
      // reply to `pubkey`
      const privateKey = await AsyncStorage.getItem('private-key')
      if (!privateKey){
        return
      }
      const signer = new NDKPrivateKeySigner(privateKey);
      const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;
  
      // this message is signed and used as a certificate
      // relate post here
      const nostrEvent: NostrEvent = {
        created_at: Math.floor((new Date()).getTime() / 1000),
        content: message,
        tags: [["t", "OfferBoard"]],
        kind: NDKKind.GroupChat,
        pubkey: pubKey
      };
  
      const signature = await signer.sign(nostrEvent);
      nostrEvent.sig = signature;
      ndk.connect().then(async () => {
        const event = new NDKEvent(ndk, nostrEvent);
        const publishResult = await event.publish();
        console.log({publishResult, event});
      });
    }
    makeMessage(offerTextInput);
    setShowAppOptions(false);
  }

  const addContact = async (id: string) => {
    // @todo: contact to seller, including escrow
    console.log(`clicked addContact`)
    const makeMessage = async ( recipientId: string, message: string) => {
      // reply to `pubkey`
      const privateKey = await AsyncStorage.getItem('private-key')
      if (!privateKey){
        return
      }
      const signer = new NDKPrivateKeySigner(privateKey);
      const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;
  
      // // sign and encrypt message here
      // const encryptedMessage = signer.encrypt
      // const recipient = new NDKUser({pubkey: recipientId})
      console.log({recipientId, privateKey, spk: signer.privateKey})

      const nostrEvent: NostrEvent = {
        created_at: Math.floor((new Date()).getTime() / 1000),
        content: message,
        tags: [["p", recipientId]],
        kind: NDKKind.GroupChat,
        pubkey: pubKey
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
        const content = await encryptPolyfill(privateKey, recipientId, message);

        // swap content with signed-and-encrypted message
        event.content = content;

        // finally, sign message
        const sig = await event.sign(signer);
        event.sig = sig;
        const publishResult = await event.publish();
        console.log({publishResult, event});

        // now, save original message in local cache.
        const messageHistory = await AsyncStorage.getItem(`trade-message-${recipientId}`)
        const messageHistoryList: NostrEvent[] = messageHistory ? JSON.parse(messageHistory) : [];
        messageHistoryList.push(messageObject);
        await AsyncStorage.setItem(`trade-message-${recipientId}`, JSON.stringify(messageHistoryList));

        // also add recipient in user list
        const traders = await AsyncStorage.getItem(`trader-list`)
        const tradersList: string[] = traders ? JSON.parse(traders) : [];
        tradersList.push(recipientId);
        await AsyncStorage.setItem(`trader-list`, JSON.stringify([...new Set(tradersList)]));

        // go to trade-history page
        router.replace("/user/trade/" + recipientId)
      });
    }

    return makeMessage(id, contactTextInput);
  }
  const addReport = async (id: string) => {
    // @todo: contact to moderator, including moderator manager
  }

  useEffect(() => {load()}, []);

  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Offer board list</Text>
    { Object.values(offerObjects ?? {}).length > 0 ?
      <ul>
        {Object.values(offerObjects ?? {}).map(offer => {
          return <li key={offer.pubkey}>
            <div>
              <p>id: {offer.id}</p>
              <p>contents: {offer.content}</p>
              <p>public key: {offer.pubkey}</p>
              <Button title="Contact him" onPress={() => setShowContactOptions(true)} />
              {showContactOptions ? (
                <View>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={(text) => setContactTextInput(text)}
                    value={contactTextInput}
                  />

                  <Button title="Send message to seller" onPress={() => addContact(offer.pubkey)} />
                  <Button title="Cancel" onPress={() => setShowContactOptions(false)} />
                </View>
              ) : (
                <View />
              )}
              <Button title="Report User" onPress={() => setShowReportOptions(true)} />
              {showReportOptions ? (
                <View>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={(text) => setReportTextInput(text)}
                    value={reportTextInput}
                  />

                  <Button title="Send message to seller" onPress={() => addReport(offer.pubkey)} />
                  <Button title="Cancel" onPress={() => setShowReportOptions(false)} />
                </View>
              ) : (
                <View />
              )}
            </div>
          </li>
        })}
      </ul>:
      <div>Loading offers, please wait</div>
    }
    <></>
    {
      isSeller ?
      <Button title="Add Offer" onPress={addOffer}/>
      : <></>
    }
    <Link href="/">Home</Link>
    {showAppOptions ? (
      <View>
        <TextInput
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => setOfferTextInput(text)}
          value={offerTextInput}
        />

        <Button title="Submit my ad" onPress={submitAd} />
        <Button title="Cancel" onPress={() => setShowAppOptions(false)} />
      </View>
    ) : (
      <View />
    )}
  </View>;
}
