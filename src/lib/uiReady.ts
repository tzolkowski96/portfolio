import { createContext } from 'react'

/** False only while the opening loader covers the page — lets entrances (Reveal)
 *  and deferred effects (the WebGL field) wait for the curtain. Defaults true so
 *  everything renders normally when no loader runs. */
export const UiReadyContext = createContext(true)
