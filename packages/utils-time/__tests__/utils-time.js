import {
  createGetTime,
  createTimeout,
  createWithTimeout,
  sleep,
  TimeoutError,
  withTimeout,
} from '..'

describe('utils-time', () => {
  jest.useFakeTimers()

  it('sleep() resolves after the given time', () => {
    const wait = sleep(1000)
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout.mock.calls[0][1]).toBe(1000)
    jest.runOnlyPendingTimers()
    return wait
  })

  it('sleep() time defaults to 0 when not provided', () => {
    const wait = sleep()
    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout.mock.calls[1][1]).toBe(0)
    jest.runOnlyPendingTimers()
    return wait
  })

  it('createTimeout() rejects after the given time', async () => {
    try {
      const timeout = createTimeout(500)
      jest.runOnlyPendingTimers()
      await timeout
    } catch (err) {
      expect(err instanceof TimeoutError).toBe(true)
      expect(err.message).toBe('Timeout after 500ms')
    }
  })

  it('withTimeout() creates a promise race between the given promise and the timeout', async () => {
    const shouldResolve = await withTimeout(Promise.resolve('hello'), 500)
    expect(shouldResolve).toBe('hello')

    const shouldTimeout = withTimeout(sleep(300), 100)
    expect(shouldTimeout).rejects.toThrow('Timeout after 100ms')
  })

  it('createWithTimeout() returns a withTimeout() function with a default time', async () => {
    const with100msTimeout = createWithTimeout(100)
    const with300msTimeout = createWithTimeout(300)

    // Default behaviour
    const shouldTimeout = with100msTimeout(sleep(300))
    expect(shouldTimeout).rejects.toThrow('Timeout after 100ms')

    // Longer timeout
    const shouldResolve = with300msTimeout(sleep(200))
    // Custom time
    const shouldNotTimeout = with100msTimeout(sleep(300), 500)

    jest.runOnlyPendingTimers()

    await Promise.all([shouldResolve, shouldNotTimeout])
  })

  it('createGetTime() returns a function returning an always increasing time', () => {
    let timeNow = 0

    const dateNow = jest.spyOn(Date, 'now').mockImplementation(() => timeNow)
    const getTime = createGetTime()

    timeNow = 1000
    const time0 = getTime()
    expect(time0).toBe(1000)

    timeNow = 2000
    const time1 = getTime()
    expect(time1).toBe(2000)

    timeNow = 1500
    const time2 = getTime()
    expect(time2).toBe(2001)

    timeNow = 2500
    const time3 = getTime()
    expect(time3).toBe(2500)

    dateNow.mockRestore()
  })
})
