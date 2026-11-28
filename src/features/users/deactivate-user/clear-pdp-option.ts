/**
 * Sentinel value for "clear PDP on assigned users" in the replacement dropdown.
 * Not a real user id. Mapped to `replacementPdpId: null` on submit.
 */
export const CLEAR_PDP_VALUE = '__clear_pdp__'

/** Label shown for clearing PDP assignments during deactivate. */
export const CLEAR_PDP_LABEL = 'Clear PDP'

/** One choice in the PDP replacement list: a real PDP, or clear. */
export type ReplacementPdpOption = {
  id: string
  name: string
  username: string
}
