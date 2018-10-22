// @flow

const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

const METHOD = 'POST'

export class HTTPError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const resOrError = (res: *) => {
  return res.ok
    ? Promise.resolve(res)
    : Promise.reject(new HTTPError(res.status, res.statusText))
}

export default (fetch: *) => (url: string) => (data: Object) => {
  const request = {
    body: JSON.stringify(data),
    headers: HEADERS,
    method: METHOD,
  }
  return fetch(url, request)
    .then(resOrError)
    .then(res => res.json())
}
