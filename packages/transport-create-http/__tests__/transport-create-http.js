import { HTTPError, resOrError } from '../'

describe('transport-create-http', () => {
  it('exports HTTPError class extending Error', () => {
    const error = new HTTPError(404, 'Not found')
    expect(error instanceof Error).toBe(true)
    expect(error.message).toBe('Not found')
    expect(error.status).toBe(404)
  })

  it('exports resOrError() utility function', async () => {
    const resOK = { ok: true }
    expect(await resOrError(resOK)).toBe(resOK)

    try {
      await resOrError({
        ok: false,
        status: 400,
        statusText: 'Bad request',
      })
    } catch (error) {
      expect(error instanceof HTTPError).toBe(true)
      expect(error.status).toBe(400)
      expect(error.message).toBe('Bad request')
    }
  })
})
