import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { BlockchainNode, BlockchainNodeType } from "./node.js"

const argv = yargs(hideBin(process.argv)).argv

// get node type from command line arguments
const NODE_TYPE = Object.values(BlockchainNodeType).includes(argv["nodeType"])
  ? argv["nodeType"]
  : BlockchainNodeType.FullNode

// get port from command line arguments
const PORT = argv["port"] ? parseInt(argv["port"]) : 3000

const blockchainNode = new BlockchainNode(NODE_TYPE, { port: PORT, enableJsonRpc: true })

blockchainNode.start().catch(error => {
  console.error(error)
  process.exit(1)
})
