import { CryptoUtils } from "../utils"
import Transaction from "./Transaction"

export class Block {
  constructor(
    public parentHash: string,
    public stateRoot: string,
    public transactionsRoot: string,
    public blockNumber: number,
    public timestamp: number,
    public nonce: number,
    public beneficiary: string,
    public transactions: Transaction[]
  ) {}

  public hash(): string {
    return CryptoUtils.hash(
      this.parentHash +
        this.stateRoot +
        this.transactionsRoot +
        this.blockNumber.toString() +
        this.timestamp.toString() +
        this.nonce.toString() +
        this.beneficiary
    )
  }

  public serialize(): string {
    return (
      this.parentHash +
      this.stateRoot +
      this.transactionsRoot +
      this.blockNumber.toString() +
      this.timestamp.toString() +
      this.nonce.toString() +
      this.beneficiary +
      this.transactions.map(transaction => transaction.serialize()).join("")
    )
  }

  public static createGenesisBlock(): Block {
    return new Block("0".repeat(64), "0".repeat(64), "0".repeat(64), 0, 0, 0, "0".repeat(40), [])
  }

  public isValidNewBlock(previousBlock: Block): boolean {
    if (previousBlock.blockNumber + 1 !== this.blockNumber) {
      return false
    }
    if (previousBlock.hash() !== this.parentHash) {
      return false
    }
    if (this.timestamp <= previousBlock.timestamp) {
      return false
    }
    if (this.hash().slice(0, 2) !== "00") {
      return false
    }
    return true
  }

  public validateTransactions(): boolean {
    return this.transactions.every(transaction => transaction.validate())
  }
}

export default Block
