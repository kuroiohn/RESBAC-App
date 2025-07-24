import { Client, Account, Avatars } from "react-native-appwrite"

export const client = new Client()

client
  .setProject('6881bad8001307cb10ef')
  .setPlatform('RESBAC.ten')

export const account = new Account(client)
export const avatars = new Avatars(client)