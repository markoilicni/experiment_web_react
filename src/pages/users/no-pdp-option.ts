/**
 * Value stored in the PDP filter when the screen asks for users with no PDP.
 * Maps to `hasPdp=false` on the list request. Not a real user id.
 */
export const NO_PDP_FILTER_VALUE = '__no_pdp__'

/** Label shown for the "no PDP assigned" choice in the PDP filter. */
export const NO_PDP_LABEL = 'No PDP'

/** One choice in the PDP filter: a real PDP, or the no-PDP sentinel. */
export type PdpFilterOption = {
  id: string
  name: string
}
