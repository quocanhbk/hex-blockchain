import Transaction from "./Transaction"
import { Level } from "level"

export class MemPool {
  private database: Level

  constructor(nodeId: string) {
    const memPoolDbPath = `db/${nodeId}/mempool`
    this.database = new Level(memPoolDbPath, { valueEncoding: "json" })
  }

  public addTransaction(transaction: Transaction) {
    this.database.put(transaction.hash(), JSON.stringify(transaction))
  }

  public removeTransaction(transaction: Transaction) {
    this.database.del(transaction.hash())
  }

  public async getTransactions(): Promise<Transaction[]> {
    let transactions: Transaction[] = []
    for await (const [_, value] of this.database.iterator()) {
      transactions.push(JSON.parse(value) as Transaction)
    }

    return transactions
  }
}

export default MemPool
