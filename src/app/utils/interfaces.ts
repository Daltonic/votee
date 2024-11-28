export interface Candidate {
  publicKey: string
  cid: number
  pollId: number
  name: string
  votes: number
  hasRegistered: boolean
}

export interface Poll {
  publicKey: string
  id: number
  description: string
  start: number // Unix timestamp
  end: number // Unix timestamp
  candidates: number
}

export interface GlobalState {
  poll: Poll | null
  candidates: Candidate[]
  regModal: string
}

export interface RootState {
  globalStates: GlobalState
}
