import { JSONRPCServer } from "json-rpc-2.0"
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

export const startNode = async (nodeType: BlockchainNodeType, options?: BlockchainNodeOptions) => {
  const { log, enableJsonRpc, port } = Object.assign({ log: true, enableJsonRpc: false, port: 3000 }, options)

  const node = await createNode(nodeType)
  const logger = new Logger(`NODE-${node.peerId.toString().slice(-8)}`)

  node.addEventListener("peer:discovery", async event => {
    if (
      node
        .getConnections()
        .map(c => c.remotePeer.toString())
        .includes(event.detail.id.toString())
    ) {
      return
    }
    log && logger.log(`Discovered: ...${event.detail.id.toString().slice(-8)}`)
    const connection = await node.dial(event.detail.id)

    if (connection) {
      log && logger.log(`Connection established to: ...${event.detail.id.toString().slice(-8)}`)
    }
  })

  node.addEventListener("peer:disconnect", e => {
    log && logger.log(`Disconnected from: ...${e.detail.id.toString().slice(-8)}`)
  })

  await node.start()
  logger.log(`Node started as ${node.nodeType} with peerId: ...${node.peerId.toString().slice(-8)}`)

  if (enableJsonRpc) {
    const server = startRpcJsonServer(port, () => {
      logger.log(`JSON-RPC server listening on port ${port}`)
    })

    server.addMethod("transaction", (transaction: Transaction) => {
      logger.info(`Received transaction from ${transaction.from} to ${transaction.to} with amount ${transaction.value}`)
    })
  }

  return node
}
