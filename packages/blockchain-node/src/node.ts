import { createNode } from "./p2p.js"
import startRpcJsonServer from "./rpcServer.js"
import { Logger, Transaction } from "@pos-blockchain/common"
export * from "./p2p.js"

export enum BlockchainNodeType {
  FullNode = "full-node",
  HalfNode = "half-node",
  Validator = "validator-node",
}

export enum BlockchainTopic {
  Transaction = "Transaction",
  Block = "Block",
}

export interface BlockchainNodeOptions {
  log?: boolean
  enableJsonRpc?: boolean
  port?: number
}

export class BlockchainNode {
  node: any
  logger: Logger
  options: Required<BlockchainNodeOptions>

  constructor(private nodeType: BlockchainNodeType, options?: BlockchainNodeOptions) {
    this.options = { log: true, enableJsonRpc: false, port: 3000, ...options }
    this.logger = new Logger(`NODE-${nodeType}`)
  }

  async start() {
    this.node = await createNode(this.nodeType)

    this.node.addEventListener("peer:discovery", async event => {
      if (
        this.node
          .getConnections()
          .map(c => c.remotePeer.toString())
          .includes(event.detail.id.toString())
      ) {
        return
      }
      this.options.log && this.logger.log(`Discovered: ...${event.detail.id.toString().slice(-8)}`)
      const connection = await this.node.dial(event.detail.id)

      if (connection) {
        this.options.log && this.logger.log(`Connection established to: ...${event.detail.id.toString().slice(-8)}`)
      }
    })

    this.node.addEventListener("peer:disconnect", e => {
      this.options.log && this.logger.log(`Disconnected from: ...${e.detail.id.toString().slice(-8)}`)
    })

    await this.node.start()
    this.logger.log(`Node started as ${this.node.nodeType} with peerId: ...${this.node.peerId.toString().slice(-8)}`)

    if (this.options.enableJsonRpc) {
      const server = startRpcJsonServer(this.options.port, () => {
        this.logger.log(`JSON-RPC server listening on port ${this.options.port}`)
      })

      server.addMethod("transaction", (transaction: Transaction) => {
        this.logger.info(
          `Received transaction from ${transaction.from} to ${transaction.to} with amount ${transaction.value}`
        )
      })
    }

    return this.node
  }
}
