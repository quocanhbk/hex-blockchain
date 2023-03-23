import BigNumber from "bignumber.js"
import crypto from "crypto"
import ec from "../utils/elliptic"

const BASE_FEE = new BigNumber(0.1)
const FEE_PER_BYTE = new BigNumber(0.01)

class Transaction {
  constructor(
    public nonce: number,
    public from: string,
    public to: string,
    public value: BigNumber,
    public transactionFee: BigNumber,
    public v: number,
    public r: string,
    public s: string
  ) {}

  public hash(): string {
    return crypto.createHash("sha256").update(this.serialize()).digest("hex")
  }

  public serialize(): string {
    return [this.nonce, this.from, this.to, this.value.toString(), this.transactionFee.toString()].join("|")
  }

  public recoverAddress(transaction: Transaction): string {
    const messageHash = Buffer.from(this.hash(), "hex")

    const signature = {
      r: Buffer.from(transaction.r, "hex"),
      s: Buffer.from(transaction.s, "hex"),
      recoveryParam: transaction.v - 27,
    }

    const key = ec.recoverPubKey(messageHash, signature, transaction.v - 27)
    const publicKey = key.encode("hex")
    const hash = crypto.createHash("sha256").update(publicKey).digest()
    const address = crypto.createHash("ripemd160").update(hash).digest("hex")

    return address
  }

  public verify(transaction: Transaction): boolean {
    // Check if transaction value and transaction fee are positive
    if (transaction.value.isNegative() || transaction.transactionFee.isNegative()) {
      return false
    }

    // check if the signature is valid
    const signerAddress = this.recoverAddress(transaction)
    if (signerAddress !== transaction.from) {
      return false
    }

    return true
  }

  public static calculateTransactionFee(transaction: Transaction): BigNumber {
    const transactionSize = Buffer.byteLength(transaction.serialize(), "utf-8")

    return BASE_FEE.plus(FEE_PER_BYTE.multipliedBy(transactionSize))
  }
}

export default Transaction
