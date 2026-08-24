// Type shim for @kirocrew/app-sdk. The real module is resolved at runtime by
// the Crew dashboard host import map (it is not published to npm), so we
// declare the subset of the exported surface this app uses — verified against
// website/src/app-sdk/index.ts and ChatEmbed.tsx in the KiroCrew repo.
declare module '@kirocrew/app-sdk' {
  import type { ReactElement, ReactNode } from 'react'

  export interface AppApiClient {
    get<T = unknown>(path: string): Promise<T>
    post<T = unknown>(path: string, body?: unknown): Promise<T>
    put<T = unknown>(path: string, body?: unknown): Promise<T>
    patch<T = unknown>(path: string, body?: unknown): Promise<T>
    del<T = unknown>(path: string): Promise<T>
  }
  export function useAppApi(): AppApiClient
  export function useAppEvents(event: string, cb: (event: unknown) => void): void
  export function useNotify(): (text: string, opts?: { type?: 'info' | 'success' | 'error' }) => void
  export function useNavBadge(): (count: number) => void

  export interface ChatLaunchOptions {
    agent?: string
    message?: string
  }
  export function useChatLauncher(): { openChat: (opts?: ChatLaunchOptions) => void }

  export interface ChatEmbedProps {
    slotKey: string
    agent?: string
    placeholder?: string
    frameless?: boolean
    startAtBottom?: boolean
    onSend?: (message: string) => Promise<unknown> | void
    aboveComposer?: ReactNode
  }
  export function ChatEmbed(props: ChatEmbedProps): ReactElement
}
