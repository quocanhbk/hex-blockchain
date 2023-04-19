import { Libp2p, createLibp2p } from "libp2p"
import { tcp } from "@libp2p/tcp"
import { mplex } from "@libp2p/mplex"
import { noise } from "@chainsafe/libp2p-noise"
import { mdns } from "@libp2p/mdns"
import { gossipsub } from "@chainsafe/libp2p-gossipsub"
import { kadDHT } from "@libp2p/kad-dht"
import { BlockchainNodeType } from "./node.js"

export interface BlockchainNode extends Libp2p {
  nodeType: BlockchainNodeType
}

export async function createNode(nodeType: BlockchainNodeType) {
  const node = await createLibp2p({
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      mdns({
        interval: 60000,
      }),
    ],
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
    }),
  })

  node["nodeType"] = nodeType

  return node as BlockchainNode
}
