import crypto from "crypto"
import ec from "./elliptic"

export class CryptoUtils {
  public static readonly ADDRESS_ZERO = "0".repeat(40)

  /**
   * Hashes the data using SHA256 and returns the hash as a hex string.
   */
  public static hash(data: string): string {
    const messageHash = crypto.createHash("sha256").update(data).digest("hex")
    return messageHash
  }

  /**
   * Signs the data using the private key and returns the signature.
   */
  public static sign(data: string, privateKey: string): string {
    const key = ec.keyFromPrivate(privateKey)
    const messageHash = this.hash(data)
    const signature = key.sign(Buffer.from(messageHash, "hex"))
    return signature.toDER("hex")
  }

  /**
   * Verifies the data using the public key and signature.
   */
  public static verify(data: string, publicKey: string, signature: string): boolean {
    const key = ec.keyFromPublic(publicKey, "hex")
    const messageHash = this.hash(data)
    return key.verify(Buffer.from(messageHash, "hex"), signature)
  }

  /**
   * Recovers the address from the data and signature.
   */
  public static recoverAddress(data: string, signature: string): string {
    const messageHash = Buffer.from(this.hash(data), "hex")
    const recoveryParam = parseInt(signature.slice(128, 130), 16)

    const key = ec.recoverPubKey(messageHash, signature, recoveryParam)
    const publicKey = key.encode("hex")
    const hash = crypto.createHash("sha256").update(publicKey).digest()
    const address = crypto.createHash("ripemd160").update(hash).digest("hex")

    return address
  }

  /**
   * Generates a new key pair and returns the public key, private key and address.
   */
  public static generateKeyPair(): {
    publicKey: string
    privateKey: string
    address: string
  } {
    const key = ec.genKeyPair()
    const publicKey = key.getPublic("hex")
    const privateKey = key.getPrivate("hex")
    const hash = crypto.createHash("sha256").update(publicKey).digest()
    const address = crypto.createHash("ripemd160").update(hash).digest("hex")

    return { publicKey, privateKey, address }
  }

  /**
   * Recover keys from a private key.
   */
  public static recoverKeys(privateKey: string): {
    publicKey: string
    address: string
  } {
    const key = ec.keyFromPrivate(privateKey)
    const publicKey = key.getPublic("hex")
    const hash = crypto.createHash("sha256").update(publicKey).digest()
    const address = crypto.createHash("ripemd160").update(hash).digest("hex")

    return { publicKey, address }
  }

  public static isValidAddress(address: string): boolean {
    return address.length === 40 && address !== this.ADDRESS_ZERO
  }
}
