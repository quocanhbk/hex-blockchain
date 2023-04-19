import axios from "axios"
import { JSONRPCClient } from "json-rpc-2.0"

const createClient = (url: string) => {
  const client = new JSONRPCClient(async jsonRPCRequest => {
    try {
      const response = await axios.post(`${url}/json-rpc`, jsonRPCRequest, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(`HTTP error: ${error.response.statusText}`)
      } else {
        throw error
      }
    }
  })

  return client
}

export default createClient
