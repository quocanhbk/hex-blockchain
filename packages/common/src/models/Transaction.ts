import BigNumber from "bignumber.js"
import crypto from "crypto"
import { CryptoUtils } from "../utils"

const BASE_FEE = new BigNumber(0.1)
const FEE_PER_BYTE = new BigNumber(0.01)

export class Transaction {
  public transactionFee: BigNumber = new BigNumber(0)
  public signature: string = ""

  constructor(public from: string, public to: string, public value: BigNumber) {}

  public async initialize(): Promise<void> {
    this.transactionFee = Transaction.calculateTransactionFee(this.serialize())
  }

  public hash(): string {
    return crypto.createHash("sha256").update(this.serialize()).digest("hex")
  }

  public serialize(): string {
    return [this.from, this.to, this.value.toString()].join("|")
  }

  public static calculateTransactionFee(data: string): BigNumber {
    const dataBytes = Buffer.byteLength(data, "utf8")
    return BASE_FEE.plus(FEE_PER_BYTE.times(dataBytes))
  }

  public validate(): boolean {
    // validate signature
    const recoveredAddress = CryptoUtils.recoverAddress(this.hash(), this.signature)
    if (recoveredAddress !== this.from) {
      return false
    }

    // validate sender balance

    // validate value

    return true
  }

  public static createStakingTransaction(to: string, value: BigNumber) {
    return new Transaction(CryptoUtils.ADDRESS_ZERO, to, value)
  }
}

export default Transaction
