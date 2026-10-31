export interface OwnerGroup {
  readonly pn: string | null
  readonly lid: string | null
  readonly all: string[]
}

export interface AddOwnerResult {
  readonly success: boolean
  readonly reason?: 'INVALID_TARGET' | 'ALREADY_OWNER'
  readonly pn?: string | null
  readonly lid?: string | null
  readonly displayId?: string
}

export interface RemoveOwnerResult {
  readonly success: boolean
  readonly reason?: 'EMPTY' | 'NO_TARGET' | 'NOT_FOUND'
  readonly targetDisplay?: string
}

export declare function cleanDigits(
  input: string | null | undefined,
): string | null

export declare function getLidFromPn(
  client: any,
  chatJid: string | null | undefined,
  pn: string,
): Promise<string | null>

export declare function getPnFromLid(
  client: any,
  chatJid: string | null | undefined,
  lid: string,
): Promise<string | null>

export declare function resolveDualIdentities(params: {
  targetDigits?: string | null
  senderRef?: any
  client?: any
  chatJid?: string | null
}): Promise<{ pn: string | null; lid: string | null }>

export declare function getOwnersFromDb(): Promise<{
  row: any
  owners: string[]
}>

export declare function groupOwners(
  owners: string[],
  client?: any,
  chatJid?: string | null,
): Promise<OwnerGroup[]>

export declare function saveOwnersToDb(
  row: any,
  owners: string[],
): Promise<void>

export declare function addOwner(params: {
  targetDigits?: string | null
  senderRef?: any
  client?: any
  chatJid?: string | null
}): Promise<AddOwnerResult>

export declare function removeOwner(params: {
  rawInput?: string | null
  senderRef?: any
  client?: any
  chatJid?: string | null
}): Promise<RemoveOwnerResult>

declare const _default: {
  cleanDigits: typeof cleanDigits
  getLidFromPn: typeof getLidFromPn
  getPnFromLid: typeof getPnFromLid
  resolveDualIdentities: typeof resolveDualIdentities
  getOwnersFromDb: typeof getOwnersFromDb
  groupOwners: typeof groupOwners
  saveOwnersToDb: typeof saveOwnersToDb
  addOwner: typeof addOwner
  removeOwner: typeof removeOwner
}

export default _default
