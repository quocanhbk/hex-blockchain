declare module "libp2p-mplex" {
  import { Muxer, MuxerFactory } from "libp2p-interfaces/src/stream-muxer/types"

  class Mplex implements Muxer {
    constructor(options?: object)
    static multicodec: string
  }

  const mplex: MuxerFactory

  export = mplex
}
