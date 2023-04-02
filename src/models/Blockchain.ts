import { keccak256 } from "ethers"
import Block from "./Block"
import Transaction from "./Transaction"
import { addBlockToDB, getBlockFromDB } from "../storage";

class Blockchain {
  public chain: Block[];

  constructor() {
    this.chain = [];
    this.init();
  }

  private async init(): Promise<void> {
    const genesisBlock = await getBlockFromDB(0);
    if (!genesisBlock) {
      const newGenesisBlock = this.createGenesisBlock();
      await addBlockToDB(newGenesisBlock);
      this.chain.push(newGenesisBlock);
    } else {
      let index = 0;
      let block: Block | null = genesisBlock;

      while (block) {
        this.chain.push(block);
        index++;
        block = (await getBlockFromDB(index));
      }
    }
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

  async addNewBlock(block: Block): Promise<boolean> {
    if (this.validateNewBlock(block)) {
      this.chain.push(block)
      await addBlockToDB(block)
      return true
    }
    return false
  }

}

export default Blockchain
