'use client'

import React, { useEffect, useMemo } from 'react'
import { FaRegEdit } from 'react-icons/fa'
import CandidateList from '@/app/components/CandidateList'
import RegCandidate from '@/app/components/RegCandidate'
import { RootState } from '@/app/utils/interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/app/store/globalSlices'
import { useParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  fetchAllCandidates,
  fetchPollDetails,
  getReadOnlyProvider,
} from '@/app/services/blokchain'

export default function PollDetails() {
  const dispatch = useDispatch()
  const { setRegModal } = globalActions
  const { publicKey } = useWallet()
  const { pollId } = useParams()

  const { poll, candidates } = useSelector(
    (states: RootState) => states.globalStates
  )
  const program = useMemo(() => getReadOnlyProvider(), [])

  useEffect(() => {
    if (!program || !pollId) return

    const fetchDetails = async () => {
      await fetchPollDetails(program!, pollId! as string)
      await fetchAllCandidates(program!, pollId! as string)
    }

    fetchDetails()
  }, [program, pollId])

  if (!poll) {
    return (
      <div className="flex flex-col items-center py-10">
        <h2 className="text-gray-700 text-lg font-semibold">
          Loading poll details...
        </h2>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center py-10 space-y-6">
        <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold">
          Poll Details
        </h2>

        <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-4/5 md:w-3/5 space-y-4 text-center">
          <h3 className="text-xl font-bold text-gray-800">
            {poll.description}
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-semibold">Starts:</span>{' '}
              {new Date(poll.start).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Ends:</span>{' '}
              {new Date(poll.end).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Candidates:</span>{' '}
              {poll.candidates}
            </p>
          </div>
        </div>

        {publicKey ? (
          <button
            className="flex justify-center items-center space-x-2 bg-gray-800 text-white rounded-full
          px-6 py-2 text-lg font-bold"
            onClick={() => dispatch(setRegModal('scale-100'))}
          >
            <span>Candidates</span>
            <FaRegEdit />
          </button>
        ) : (
          <button
            className="flex justify-center items-center space-x-2 bg-gray-800 text-white rounded-full
            px-6 py-2 text-lg font-bold"
          >
            <span>Candidates</span>
          </button>
        )}

        {candidates.length > 0 && (
          <CandidateList
            candidates={candidates}
            pollAddress={poll.publicKey}
            pollId={poll.id}
          />
        )}
      </div>

      <RegCandidate pollId={poll.id} pollAddress={poll.publicKey} />
    </>
  )
}
