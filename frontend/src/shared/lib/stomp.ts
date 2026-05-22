import { Client } from '@stomp/stompjs'

type StompMessageHandler = (body: string) => void
type StompConnectHandler = () => void

type StompConnection = {
  close: () => void
}

const RECONNECT_DELAY = 3000

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || ''

  if (apiUrl) {
    return `${apiUrl.replace(/^http/, 'ws')}/ws`
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'

  return `${protocol}://${window.location.host}/ws`
}

export const connectNotificationsSocket = (
  accessToken: string,
  onMessage: StompMessageHandler,
  onConnect?: StompConnectHandler,
): StompConnection => {
  const wsUrl = getSocketUrl()

  const client = new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onConnect?.()
      client.subscribe('/user/queue/notifications', (message) => {
        onMessage(message.body)
      })
    },
  })

  client.activate()

  return {
    close: () => {
      client.deactivate()
    },
  }
}
