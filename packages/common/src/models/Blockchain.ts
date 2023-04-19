import { BigNumber } from "bignumber.js"
import Block from "./Block"

export class Blockchain {
  public nodeId: string
  public chain: Block[]
  public balances: Map<string, BigNumber>

  constructor(nodeId: string) {
    this.nodeId = nodeId
    this.chain = [Block.createGenesisBlock()]
    this.balances = new Map<string, BigNumber>()
  }

  public addBlock(block: Block): void {
    this.chain.push(block)
  }
}

export default Blockchain
