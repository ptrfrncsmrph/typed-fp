import { Uri } from '@typed/fp/Uri'
import { HistoryEnv } from '../HistoryEnv'
import { ServerHistory } from './ServerHistory'
import { ServerLocation } from './ServerLocation'

/**
 * Create A History Environment that works in browser and non-browser environments
 * @param href :: initial href to use
 */
export function createServerHistoryEnv<A>(uri: Uri = Uri.wrap('/')): HistoryEnv<A> {
  const serverLocation = new ServerLocation(uri)
  const serverHistory = new ServerHistory(serverLocation)
  serverLocation.setHistory(serverHistory)

  return {
    location: serverLocation,
    history: serverHistory,
  }
}
