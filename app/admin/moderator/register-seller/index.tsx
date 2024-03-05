import { Button, Text, TextInput, View } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

export default function Page() {
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorRequestQueue, setModeratorRequestQueue] = useState<{[key:string]: any}>({});
  const ndk = new NDK({
    explicitRelayUrls: ["ws://10.24.95.91:8080", "wss://nos.lol"],
  });

  const load = async () => {
    setIsModerator(await AsyncStorage.getItem('is-moderator') == "yes" ?? false);
    console.log(`load called`);
    
    // fetch message for me, group by authors
    const privateKey = await AsyncStorage.getItem('private-key')
    if (privateKey){
      const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;

      // Create a new NDK instance with explicit relays
      ndk.connect().then(async () => {
        const subscription = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#p": [pubKey] });
        console.log(`try subscription`);
        subscription.on("event", (event: NDKEvent) => {
          console.log("before set state", event.id, event, moderatorRequestQueue, Object.values(moderatorRequestQueue))
          // add message to queue if message contains `/RegisterSeller` or something
          if (event.content.includes("/RegisterSeller")){
            const status = "not-replied";
            const eventWithStatus = {...event, status: status};
            setModeratorRequestQueue(queue => {
              const subscriptionToEvent = ndk.subscribe({ kinds: [NDKKind.GroupChat], "#e": [event.id] });
              subscriptionToEvent.on("event",  (childEvent: NDKEvent) => {
                console.log(`found some replies to ${event.id}, ${childEvent.id}`);
                eventWithStatus.status = `replied`
                setModeratorRequestQueue(q => ({...q, [event.id]: eventWithStatus}))
                // stop subscription here
                subscriptionToEvent.stop();
              });
              return ({
                ...queue,
                [event.id]: eventWithStatus,
              });
            })
          }
          console.log("after set state", Object.values(moderatorRequestQueue), queue, moderatorRequestQueue)
        })
      });
  
      // for each authors, you can check approve or deny.
      // sign the message for approval and broadcast it  
    }
  }
  const makeMessage = async (srcNoteId: string, candidatePubkey: string, message: string) => {
    // reply to `pubkey`
    const privateKey = await AsyncStorage.getItem('private-key')
    const signer = new NDKPrivateKeySigner(privateKey);
    const pubKey = (await new NDKPrivateKeySigner(privateKey).user()).pubkey;

    // this message is signed and used as a certificate
    // relate post here
    const nostrEvent: NostrEvent = {
      created_at: Math.floor((new Date()).getTime() / 1000),
      content: message,
      tags: [["p", candidatePubkey], ["e", srcNoteId]],
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
  const approve = async (srcMessageNoteId: string, candidatePubkey: string) => {
    await makeMessage(srcMessageNoteId, candidatePubkey, "I approved your request, valid for 30 days")
  }
  const reject = async (srcMessageNoteId: string, candidatePubkey: string) => {
    await makeMessage(srcMessageNoteId, candidatePubkey, "I reject your request")
  }
  useEffect(() => {load()}, []);
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    {isModerator ? <>
        <div>
          <p>You are moderator.</p>
          <div>
            {Object.values(moderatorRequestQueue).length > 0 ? 
              <ul>
                {Object.values(moderatorRequestQueue).map(event => {
                  return <li key={event.id}>
                    <div>id: {event.id}</div>
                    <div>pubkey: {event.pubkey}</div>
                    <div>content: {event.content}</div>
                    <div>created_at: {event.created_at}</div>
                    {event.status != "replied" ?
                      <div>
                        <button onClick={() => approve(event.id, event.pubkey)}>approve</button>
                        <button onClick={() => reject(event.id, event.pubkey)}>reject</button>
                      </div>
                      :<div>
                        i already replied
                      </div>
                    }
                  </li>
                })}
              </ul>
            : <div>Please wait while loading</div>
          }
          </div>
          <Link href="/">Home</Link>          
        </div>
      </>:<>
        <Link href="/">Home</Link>
      </>
    }
  </View>;
}
