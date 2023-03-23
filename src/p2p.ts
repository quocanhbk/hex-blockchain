import Libp2p from "libp2p"
import TCP from "libp2p-tcp"
import { NOISE } from "libp2p-noise"
import MPLEX from "libp2p-mplex"
import MulticastDNS from "libp2p-mdns"

export async function createNode() {
  const node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      peerDiscovery: [MulticastDNS],
    },
  })

  return node
}
