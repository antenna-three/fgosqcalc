import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialState: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState(initialState)
  useEffect(() => {
    const json = localStorage.getItem(key)
    if (json) {
      const obj = JSON.parse(json)
      if (
        typeof initialState == 'object' &&
        Object.prototype.toString.call(initialState) == '[object Object]'
      ) {
        setState({ ...initialState, ...obj })
      } else {
        setState(obj)
      }
    }
  }, [])
  useEffect(() => {
    const json = JSON.stringify(state)
    localStorage.setItem(key, json)
  }, [state])
  return [state, setState]
}
