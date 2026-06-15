import type { ReactNode } from 'react'

// Jeu d'icônes au trait, inspiré d'IBM Carbon. Couleur = currentColor.
const PATHS: Record<string, ReactNode> = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'caret-up': <path d="M6 14l6-6 6 6" />,
  'caret-down': <path d="M6 10l6 6 6-6" />,
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'arrow-left': <path d="M20 12H5M11 18l-6-6 6-6" />,
  'chevron-down': <path d="M5 9l7 7 7-7" />,
  time: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.6 1.8M9.5 3h5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.2l9 15.6H3z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="16.7" r="0.4" fill="currentColor" stroke="none" />
    </>
  ),
  printer: <path d="M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M7 14h10v6H7z" />,
  download: <path d="M12 4v10M8 12l4 4 4-4M5 20h14" />,
  renew: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" />,
  location: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  video: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h9A1.5 1.5 0 0 1 15 7.5v9A1.5 1.5 0 0 1 13.5 18h-9A1.5 1.5 0 0 1 3 16.5zM15 10l6-3.2v10.4L15 14" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />,
  navigation: <path d="M3 11l18-8-8 18-2.2-7.8z" />,
  hospital: (
    <>
      <path d="M4 21V8l8-4 8 4v13M9 21v-5h6v5" />
      <path d="M12 8.5v4M10 10.5h4" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4h6v2.5H9z" />
      <path d="M9 5H5.5v15h13V5H15M8.5 11h7M8.5 15h4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  heart: <path d="M12 20.5l-1.3-1.2C5.9 14.9 3 12.1 3 8.7 3 6 5 4 7.5 4c1.5 0 3 .8 3.9 2 .9-1.2 2.4-2 3.9-2C17.8 4 20 6 20 8.7c0 3.4-3 6.2-7.7 10.6z" />,
  map: <path d="M9 4L3 6.2v13.6L9 18l6 2 6-2.2V4.2L15 6 9 4zM9 4v14M15 6v14" />,
  list: <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />,
  phone: <path d="M6.5 3.5h3l1.5 5-2.1 1.5a12.5 12.5 0 0 0 5.1 5.1L15.5 13l5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />,
}

export function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.75,
}: {
  name: keyof typeof PATHS | string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] || null}
    </svg>
  )
}
