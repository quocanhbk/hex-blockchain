import { keccak256 } from "ethers"
import Block from "./Block"
import Transaction from "./Transaction"

class Blockchain {
  public chain: Block[]

  constructor() {
    this.chain = [this.createGenesisBlock()]
  }

  createGenesisBlock(): Block {
    const genesisBlock = new Block("0", keccak256("0x"), keccak256("0x"), 0, Date.now(), 0, "0", [])
    return genesisBlock
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1]
  }

  isValidTransaction(transaction: Transaction): boolean {
    // Implement basic transaction validation, such as checking the transaction hash
    const txHash = transaction.hash()
    // ... (add more validation rules)
    return true
  }

  addTransaction(transaction: Transaction): boolean {
    if (this.isValidTransaction(transaction)) {
      // Add the transaction to the latest block's transactions
      this.getLatestBlock().transactions.push(transaction)
      return true
    }
    return false
  }

  validateNewBlock(block: Block): boolean {
    // Implement a basic PoS consensus mechanism
    const prevBlock = this.getLatestBlock()
    if (block.parentHash !== prevBlock.hash()) {
      return false
    }
    // ... (add more validation rules)
    return true
  }

  addNewBlock(block: Block): boolean {
    if (this.validateNewBlock(block)) {
      this.chain.push(block)
      return true
    }
    return false
  }
}

export default Blockchain
