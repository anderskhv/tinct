export function ReadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 5.5c2.7-.8 5.2-.2 8.5 1.8v11c-3.3-2-5.8-2.6-8.5-1.8v-11Zm17 0c-2.7-.8-5.2-.2-8.5 1.8v11c3.3-2 5.8-2.6 8.5-1.8v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}


export function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.4 10.8c0-3.1 2.9-5.6 6.5-5.6s6.5 2.5 6.5 5.6-2.9 5.6-6.5 5.6c-.7 0-1.4-.1-2.1-.3L5 17.6l.5-2.8c-.7-1.1-1.1-2.5-1.1-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 16.6c.6.2 1.3.4 2.1.4 3.6 0 6.5-2.2 6.5-5 0-1.1-.5-2.2-1.2-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

