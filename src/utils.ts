export function throwError (error: Error) {
  throw error
}

export function nextTick (cb: () => void, count: number = 1) {
  if (count) {
    setTimeout(() => nextTick(cb, count - 1))
  } else {
    cb()
  }
}