import { Account, CryptoUtils, Transaction, Wallet } from "@pos-blockchain/common"
import { BigNumber } from "bignumber.js"
import { Level } from "level"

export class WalletManagement {
  private database: Level

  constructor(dbPath: string) {
    this.database = new Level(dbPath, { valueEncoding: "json" })
  }

  public async createWallet(): Promise<Wallet> {
    const wallet = new Wallet()
    await this.database.put(`wallet:${wallet.account.address}`, JSON.stringify(wallet))
    return wallet
  }

  public async importWallet(privateKey: string): Promise<Wallet> {
    const wallet = Wallet.importAccount(privateKey)
    await this.database.put(`wallet:${wallet.account.address}`, JSON.stringify(wallet))

    return wallet
  }

  public async getCurrentWalletAddress(): Promise<string | null> {
    return (await this.database.get("current_wallet").catch(() => null)) as string | null
  }

  public async getWallet(address: string): Promise<Wallet | null> {
    return (await this.database
      .get(`wallet:${address}`)
      .then(json => JSON.parse(json))
      .catch(() => null)) as Wallet | null
  }

  public async listWallets(): Promise<{ address: string; balance: string }[]> {
    const wallets: { address: string; balance: string }[] = []
    for await (const [key, value] of this.database.iterator({ gte: "wallet:", lte: "wallet:\xff" })) {
      const wallet = JSON.parse(value) as Wallet
      wallets.push({ address: wallet.account.address, balance: wallet.balance.toString() })
    }

    return wallets
  }

  public async selectWallet(address: string): Promise<void> {
    const wallet = await this.getWallet(address)
    if (!wallet) {
      throw new Error("Wallet not found")
    }

    await this.database.put("current_wallet", address)
  }

  public async removeWallet(address: string): Promise<void> {
    // throw error if wallet is current wallet
    const currentWalletAddress = await this.getCurrentWalletAddress()

    if (currentWalletAddress === address) {
      throw new Error("Cannot remove current wallet")
    }

    await this.database.del(`wallet:${address}`)
  }

  public async getWalletChoices(): Promise<string[]> {
    const wallets = await this.listWallets()
    return wallets.map(wallet => wallet.address)
  }

  public async initTransaction(to: string, amount: BigNumber): Promise<Transaction> {
    // get current wallet
    const currentWalletAddress = await this.getCurrentWalletAddress()
    if (!currentWalletAddress) {
      throw new Error("No wallet selected")
    }

    const currentWallet = await this.getWallet(currentWalletAddress)
    if (!currentWallet) {
      throw new Error("Wallet not found")
    }

    // validate if to address is valid
    if (!CryptoUtils.isValidAddress(to)) {
      throw new Error("Invalid address")
    }

    // check if current wallet has enough balance
    if (new BigNumber(currentWallet.balance).lt(amount)) {
      throw new Error("Insufficient balance")
    }

    // create transaction
    const transaction = Wallet.createTransaction(currentWallet.account.address, to, amount)

    return transaction
  }

  public async signTransaction(transaction: Transaction): Promise<Transaction> {
    // get current wallet
    const currentWalletAddress = await this.getCurrentWalletAddress()
    if (!currentWalletAddress) {
      throw new Error("No wallet selected")
    }

    const currentWallet = await this.getWallet(currentWalletAddress)
    if (!currentWallet) {
      throw new Error("Wallet not found")
    }

    if (currentWallet.account.address !== transaction.from) {
      throw new Error("Invalid transaction")
    }

    const account = new Account(currentWallet.account)

    // sign transaction
    const signedTransaction = account.signTransaction(transaction)

    return signedTransaction
  }
}
