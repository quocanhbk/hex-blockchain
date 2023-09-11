import { Logger } from "@pos-blockchain/common"
import inquirer from "inquirer"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { WalletManagement } from "./WalletManagement.js"
import createClient from "./rpcClient.js"

const argv = yargs(hideBin(process.argv)).argv

const NODE_SERVER = argv["node_server"] ? argv["node_server"] : "http://localhost:3000"

let logger = new Logger("Wallet")

enum WalletActions {
  CreateWallet = "Create wallet",
  ImportWallet = "Import wallet",
  ViewWallet = "View wallet",
  ListWallets = "List wallets",
  SelectWallet = "Select wallet",
  RemoveWallet = "Remove wallet",
  SendTransaction = "Send transaction",
  Exit = "Exit",
}

const main = async () => {
  const client = createClient(NODE_SERVER)

  const walletManagement = new WalletManagement("./data")

  const prompt = async () => {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an action:",
        choices: Object.values(WalletActions),
      },
    ])

    switch (action) {
      case WalletActions.CreateWallet:
        const wallet = await walletManagement.createWallet()
        logger.log(`Wallet created with address: ${wallet.account.address}`)
        confirmContinue()
        break

      case WalletActions.ImportWallet:
        const { privateKey } = await inquirer.prompt([
          {
            type: "input",
            name: "privateKey",
            message: "Enter your private key:",
          },
        ])

        try {
          const wallet = await walletManagement.importWallet(privateKey)
          logger.log(`Wallet imported with address: ${wallet.account.address}`)
        } catch (error) {
          console.error("Invalid private key")
        }
        confirmContinue()
        break

      case WalletActions.ViewWallet:
        const currentWalletAddress = await walletManagement.getCurrentWalletAddress()
        if (!currentWalletAddress) {
          logger.error("No wallet selected")
          confirmContinue()
          break
        }
        const currentWallet = await walletManagement.getWallet(currentWalletAddress)

        if (currentWallet) {
          logger.log(`Public key: ${currentWallet.account.publicKey}`)
          logger.log(`Private key: ${currentWallet.account.privateKey}`)
          logger.log(`Address: ${currentWallet.account.address}`)
          logger.log(`Balance: ${currentWallet.balance}`)
        } else {
          logger.error("No wallet selected")
        }
        confirmContinue()
        break

      case WalletActions.ListWallets:
        const wallets = await walletManagement.listWallets()
        if (wallets.length === 0) {
          logger.log("No wallets found")
        }
        wallets.forEach(wallet => {
          logger.log(`Address: ${wallet.address} Balance: ${wallet.balance}`)
        })
        confirmContinue()
        break

      case WalletActions.SelectWallet:
        const { address } = await inquirer.prompt([
          {
            type: "list",
            name: "address",
            message: "Select a wallet:",
            choices: await walletManagement.getWalletChoices(),
          },
        ])

        await walletManagement.selectWallet(address)
        logger.log(`Wallet ${address} selected`)
        confirmContinue()
        break

      case WalletActions.RemoveWallet:
        const { addressToRemove } = await inquirer.prompt([
          {
            type: "list",
            name: "addressToRemove",
            message: "Select a wallet to remove:",
            choices: await walletManagement.getWalletChoices(),
          },
        ])

        try {
          await walletManagement.removeWallet(addressToRemove)
          logger.log(`Wallet ${addressToRemove} removed`)
        } catch (error: any) {
          logger.error(error.message)
        }
        confirmContinue()
        break

      case WalletActions.SendTransaction:
        const { receiver, amount } = await inquirer.prompt([
          {
            type: "input",
            name: "receiver",
            message: "Enter receiver address:",
          },
          {
            type: "input",
            name: "amount",
            message: "Enter amount:",
          },
        ])

        try {
          const transaction = await walletManagement.initTransaction(receiver, amount)
          // prompt to sign transaction
          const { signTransaction } = await inquirer.prompt([
            {
              type: "confirm",
              name: "signTransaction",
              message: "Sign transaction?",
            },
          ])

          if (!signTransaction) {
            logger.log("Sender denied to sign transaction")
            confirmContinue()
            break
          }

          const signedTransaction = await walletManagement.signTransaction(transaction)
          client.request("transaction", signedTransaction)
          logger.log("Transaction sent successfully")
        } catch (error: any) {
          logger.error(error.message)
        }

        confirmContinue()
        break
    }
  }

  const confirmContinue = async () => {
    const { continueAction } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAction",
        message: "Continue?",
      },
    ])

    if (continueAction) {
      console.clear()
      prompt()
    } else {
      process.exit(0)
    }
  }

  prompt()
}

main().catch(error => {
  logger.error(error.message)
  process.exit(1)
})
