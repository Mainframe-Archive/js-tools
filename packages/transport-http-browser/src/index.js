// @flow
/* eslint-env browser */

import createHTTP from '@mainframe/transport-create-http'

export default createHTTP(window.fetch)
