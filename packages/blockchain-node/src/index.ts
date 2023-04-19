import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { BlockchainNodeType, startNode } from "./node.js"

const argv = yargs(hideBin(process.argv)).argv

const NODE_TYPE = Object.values(BlockchainNodeType).includes(argv["nodeType"])
  ? argv["nodeType"]
  : BlockchainNodeType.FullNode
const PORT = argv["port"] ? parseInt(argv["port"]) : 3000

startNode(NODE_TYPE, { port: PORT, enableJsonRpc: true }).catch(error => {
  console.error(error)
  process.exit(1)
})
