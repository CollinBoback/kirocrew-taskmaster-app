// Mock of @kirocrew/ui for the dev harness — only the components this app
// imports. The real module is host-vendored (shared-modules.ts).

export function MarkdownRenderer({ content }: { content: string; streaming?: boolean; softBreaks?: boolean }) {
  return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>
}
