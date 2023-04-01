import { createNode } from "./p2p"
;(async () => {
  const node = await createNode()

  node.on("peer:discovery", async peerId => {
    console.log("Discovered:", peerId.toB58String())
    const connection = await node.dial(peerId)

    if (connection) {
      console.log("Connection established to:", peerId.toB58String())
    }
  })

  node.on("peer:connect", connection => {
    console.log("Connected to:", connection.remotePeer.toB58String())
  })

  await node.start()
  console.log("Node started with peerId:", node.peerId.toB58String())
})().catch(error => {
  console.error("Error:", error)
  process.exit(1)
})
