export interface MenuItem {
  name: string
  group: string
  commands: string[]
  withoutPrefix?: boolean
  description: string
}

export interface FormatMenuOptions {
  prefix?: string
  userName?: string
  groupFilter?: string
}

export function getMenuByLabel(): Map<string, MenuItem[]>
export function getMenuByCategory(): Map<string, MenuItem[]>
export function formatMenuText(options?: FormatMenuOptions): string

declare const _default: {
  getMenuByLabel: typeof getMenuByLabel
  getMenuByCategory: typeof getMenuByCategory
  formatMenuText: typeof formatMenuText
}

export default _default
