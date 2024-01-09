import { Button, Text, TextInput, View, FlatList } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

export default function Page() {
  const arr: {key: string}[] = [
    {key: 'Devin'},
    {key: 'Dan'},
    {key: 'Dominic'},
    {key: 'Jackson'},
    {key: 'James'},
    {key: 'Joel'},
    {key: 'John'},
    {key: 'Jillian'},
    {key: 'Jimmy'},
    {key: 'Julie'},
  ];
  return <View style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
    <Text>Offer board list</Text>
    <FlatList
        data={arr}
        renderItem={({item}) => <Link href={{
          pathname: "/trade/[id]",
          params: { id: item.key }
        }}>{item.key}</Link>}
      />
    <Button title="Add Offer"/>

    <Link href="/">Home</Link>
  </View>;
}
