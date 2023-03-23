import { keccak256 } from "ethers"
import Transaction from "./Transaction"

class Block {
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

  hash(): string {
    return keccak256(
      this.parentHash +
        this.stateRoot +
        this.transactionsRoot +
        this.blockNumber.toString() +
        this.timestamp.toString() +
        this.nonce.toString() +
        this.beneficiary
    )
  }
}

export default Block
