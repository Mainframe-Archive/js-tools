// @flow

import RequestRPC from '@mainframe/rpc-request'
import web3Transport from '@mainframe/transport-web3'

export default (provider?: ?Object) => new RequestRPC(web3Transport(provider))
