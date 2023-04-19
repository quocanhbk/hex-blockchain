import { CryptoUtils } from "../utils"
import Transaction from "./Transaction"

export class Account {
  public privateKey: string
  public publicKey: string
  public address: string

  constructor({ privateKey, publicKey, address }: { privateKey: string; publicKey: string; address: string }) {
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.address = address
  }

  public static createNew() {
    const keys = CryptoUtils.generateKeyPair()
    return new Account(keys)
  }

  /**
   * `signTransaction(transaction: Transaction): Transaction`
   * Signs a transaction with the account's private key and returns the signed transaction.
   */
  public signTransaction(transaction: Transaction): Transaction {
    const signature = CryptoUtils.sign(transaction.hash(), this.privateKey)

    transaction.signature = signature

    return transaction
  }

  /**
   * `verifyTransaction(transaction: Transaction): boolean`
   * Verifies a transaction with the account's public key and returns true if the transaction is valid.
   */
  public verifyTransaction(transaction: Transaction): boolean {
    return CryptoUtils.verify(transaction.hash(), this.publicKey, transaction.signature)
  }

  /**
   * `signMessage(message: string): string`
   * Signs a message with the account's private key and returns the signed message.
   */
  public signMessage(message: string): string {
    return CryptoUtils.sign(message, this.privateKey)
  }

  /**
   * `verifyMessage(message: string, signature: string): boolean`
   *  Verifies a message with the account's public key and returns true if the message is valid.
   */
  public verifyMessage(message: string, signature: string): boolean {
    return CryptoUtils.verify(message, this.publicKey, signature)
  }

  /**
   * `importPrivateKey(privateKey: string): void`
   * Imports a private key and sets the account's private key, public key, and address.
   */
  public static importPrivateKey(privateKey: string): Account {
    const { publicKey, address } = CryptoUtils.recoverKeys(privateKey)

    const account = new Account({ privateKey, publicKey, address })

    return account
  }
}

export default Account
