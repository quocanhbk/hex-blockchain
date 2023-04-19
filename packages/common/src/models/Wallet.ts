import BigNumber from "bignumber.js"
import Account from "./Account"
import Transaction from "./Transaction"

export class Wallet {
  public account: Account
  public balance: BigNumber
  public transactionHistory: Transaction[]

  constructor() {
    this.account = Account.createNew()
    this.balance = new BigNumber(0)
    this.transactionHistory = []
  }

  /**
   * Creates a new wallet
   */
  public static createNew(): Wallet {
    return new Wallet()
  }

  /**
   * Imports an existing wallet
   */
  public static importAccount(privateKey: string): Wallet {
    const wallet = new Wallet()
    wallet.account = Account.importPrivateKey(privateKey)
    return wallet
  }

  /**
   * Creates a transaction
   */
  public static createTransaction(from: string, to: string, amount: BigNumber): Transaction {
    const transaction = new Transaction(from, to, amount)

    return transaction
  }
}

export default Wallet
