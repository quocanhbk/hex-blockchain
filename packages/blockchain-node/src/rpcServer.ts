import bodyParser from "body-parser"
import express from "express"
import { JSONRPCServer } from "json-rpc-2.0"

const startRpcJsonServer = (rpcPort: number, callback?: () => void) => {
  const server = new JSONRPCServer()

  const app = express()
  app.use(bodyParser.json())

  app.post("/json-rpc", async (req, res) => {
    const jsonRPCRequest = req.body

    try {
      server.receive(jsonRPCRequest).then(jsonRPCResponse => {
        if (jsonRPCResponse) res.json(jsonRPCResponse)
        else res.sendStatus(204)
      })
    } catch (error: any) {
      if (error.code === -32601) {
        // Method not found error
        console.error(`Received a request for an undefined method: ${jsonRPCRequest.method}`)
      } else {
        console.error(`An error occurred while processing the request: ${error.message}`)
      }
      res.status(400).json(error)
    }
  })

  app.listen(rpcPort, callback ? callback : () => console.log(`JSON-RPC server listening on port ${rpcPort}`))

  return server
}

export default startRpcJsonServer
