// @flow

import createHTTP from '@mainframe/transport-create-http'
import fetch from 'node-fetch'

export default createHTTP(fetch)
