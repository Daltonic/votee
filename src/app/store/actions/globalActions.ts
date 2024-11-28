import { Candidate, GlobalState, Poll } from '@/app/utils/interfaces'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
  setCandidates: (states: GlobalState, action: PayloadAction<Candidate[]>) => {
    states.candidates = action.payload
  },
  setPoll: (states: GlobalState, action: PayloadAction<Poll>) => {
    states.poll = action.payload
  },
  setRegModal: (states: GlobalState, action: PayloadAction<string>) => {
    states.regModal = action.payload
  },
}
