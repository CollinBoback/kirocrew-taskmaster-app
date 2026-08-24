// Type shim for @kirocrew/ui — the host-vendored shared component library
// (import-map name verified against website/src/app-sdk/shared-modules.ts;
// the docs' "@kirocrew/app-sdk/ui" spelling is stale). Only the components
// this app uses are declared.
declare module '@kirocrew/ui' {
  import type { ReactElement } from 'react'

  export function MarkdownRenderer(props: {
    content: string
    streaming?: boolean
    softBreaks?: boolean
  }): ReactElement
}
