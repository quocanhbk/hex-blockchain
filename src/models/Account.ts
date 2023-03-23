import crypto from "crypto"
import elliptic from "elliptic"
import ec from "../utils/elliptic"
import Transaction from "./Transaction"

class Account {
  private privateKey: string
  private publicKey: string
  public address: string

  constructor() {
    const keyPair = ec.genKeyPair()
    this.privateKey = keyPair.getPrivate("hex")
    this.publicKey = keyPair.getPublic("hex")
    const hash = crypto.createHash("sha256").update(this.publicKey).digest()
    this.address = crypto.createHash("ripemd160").update(hash).digest("hex")
  }

  sign(data: string): elliptic.ec.Signature {
    const key = ec.keyFromPrivate(this.privateKey)
    const messageHash = crypto.createHash("sha256").update(data).digest()

    const signature = key.sign(Buffer.from(messageHash))

    return signature
  }

  signTransaction(transaction: Transaction): Transaction {
    const signature = this.sign(transaction.hash())
    transaction.v = signature.recoveryParam! + 27
    transaction.r = signature.r.toString("hex")
    transaction.s = signature.s.toString("hex")

    return transaction
  }

  verify(data: string, signature: elliptic.ec.Signature): boolean {
    const key = ec.keyFromPublic(this.publicKey, "hex")
    const messageHash = crypto.createHash("sha256").update(data).digest()

    return key.verify(Buffer.from(messageHash), signature)
  }

  static recover(privateKey: string): Account {
    const key = ec.keyFromPrivate(privateKey)
    const publicKey = key.getPublic("hex")
    const hash = crypto.createHash("sha256").update(publicKey).digest()
    const address = crypto.createHash("ripemd160").update(hash).digest("hex")

    const account = new Account()
    account.privateKey = privateKey
    account.publicKey = publicKey
    account.address = address

    return account
  }
}

export default Account
