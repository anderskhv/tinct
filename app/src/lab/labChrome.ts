/** Production desktop still uses the vertical Chat / Feed / Cast rails. */
export const PRODUCTION_DESKTOP_PANES = ['Chat', 'Feed', 'Cast'] as const

/** The lab desktop right pane is Ask only. */
export const LAB_DESKTOP_PANES = ['Ask'] as const

export type ProductionDesktopPane = typeof PRODUCTION_DESKTOP_PANES[number]
export type LabDesktopPane = typeof LAB_DESKTOP_PANES[number]

export function isProductionDesktopPane(label: string): label is ProductionDesktopPane {
  return (PRODUCTION_DESKTOP_PANES as readonly string[]).includes(label)
}

export function isLabDesktopPane(label: string): label is LabDesktopPane {
  return (LAB_DESKTOP_PANES as readonly string[]).includes(label)
}
