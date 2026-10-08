import type { SVGProps } from 'react'

export function ReadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 5.5c2.7-.8 5.2-.2 8.5 1.8v11c-3.3-2-5.8-2.6-8.5-1.8v-11Zm17 0c-2.7-.8-5.2-.2-8.5 1.8v11c3.3-2 5.8-2.6 8.5-1.8v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}


type LabActionIconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

/**
 * Chat: the one chat icon in the reader. The selection menu, the Explain card,
 * the Librarian row, the phone bar and Contents all draw this
 * glyph, so Chat always looks the same. Stroke sits on the root so a surface
 * can set its own weight from CSS.
 */
export const CHAT_ICON_PATHS = [
  'M4.4 10.8c0-3.1 2.9-5.6 6.5-5.6s6.5 2.5 6.5 5.6-2.9 5.6-6.5 5.6c-.7 0-1.4-.1-2.1-.3L5 17.6l.5-2.8c-.7-1.1-1.1-2.5-1.1-4Z',
  'M11.2 16.6c.6.2 1.3.4 2.1.4 3.6 0 6.5-2.2 6.5-5 0-1.1-.5-2.2-1.2-3',
] as const

export function ChatIcon({ size = 20, ...rest }: LabActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon="chat" {...rest}>
      {CHAT_ICON_PATHS.map(d => <path key={d} d={d} />)}
    </svg>
  )
}

/** Highlight: the one highlighter icon, as Contents shows highlights. */
export const HIGHLIGHT_ICON_PATHS = [
  'm9 11-6 6v3h9l3-3',
  'm22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4',
] as const

export function HighlightIcon({ size = 20, ...rest }: LabActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon="highlight" {...rest}>
      {HIGHLIGHT_ICON_PATHS.map(d => <path key={d} d={d} />)}
    </svg>
  )
}


export function TalkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4.2" y="9" width="2.6" height="6" rx="1.1" />
      <rect x="10.7" y="5" width="2.6" height="14" rx="1.1" />
      <rect x="17.2" y="8" width="2.6" height="8" rx="1.1" />
    </svg>
  )
}


/** Keeps exactly the same icon box as Play; reduced motion leaves a static arc. */
export function LoadingIcon({ size = 21 }: { size?: number }) {
  return <svg className="lab-audio-spinner" data-testid="lab-audio-spinner" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3a9 9 0 1 1-8.1 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
}
