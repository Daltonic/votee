'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import { BN } from '@coral-xyz/anchor'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { createPoll, getCounter, getProvider } from '../services/blokchain'

const Page: NextPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [nextCount, setNextCount] = useState<BN>(new BN(0))
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const [formData, setFormData] = useState({
    description: '',
    startDate: '',
    endDate: '',
  })

  const fetchCounter = async () => {
    if (!program) return
    const count = await getCounter(program!)
    setNextCount(count.add(new BN(1)))
    setIsInitialized(count.gte(new BN(0)))
  }

  useEffect(() => {
    fetchCounter()
  }, [program, submitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !isInitialized) return

    const { description, startDate, endDate } = formData

    const startTimestamp = new Date(startDate).getTime() / 1000
    const endTimestamp = new Date(endDate).getTime() / 1000

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          setSubmitting(true)
          const tx = await createPoll(
            program!,
            publicKey!,
            nextCount,
            description,
            startTimestamp,
            endTimestamp
          )

          console.log(tx)
          setFormData({
            description: '',
            startDate: '',
            endDate: '',
          })

          await fetchCounter()
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h-16"></div>
      <div className="flex flex-col justify-center items-center space-y-6 w-full">
        <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold">
          Create Poll
        </h2>

        <form
          className="bg-white border border-gray-300 rounded-2xl
        shadow-lg p-6 w-4/5 md:w-2/5 space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700"
            >
              Poll Description
            </label>
            <input
              type="text"
              id="description"
              placeholder="Briefly describe the purpose of this poll..."
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-300
              rounded-lg shadow-sm focus:ring-2 focus:ring-black
              focus:outline-none bg-gray-100 text-gray-800"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-semibold text-gray-700"
            >
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startDate"
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-300
              rounded-lg shadow-sm focus:ring-2 focus:ring-black
              focus:outline-none bg-gray-100 text-gray-800"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-semibold text-gray-700"
            >
              End Date
            </label>
            <input
              type="datetime-local"
              id="endDate"
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-300
              rounded-lg shadow-sm focus:ring-2 focus:ring-black
              focus:outline-none bg-gray-100 text-gray-800"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              type="submit"
              className="bg-black text-white font-bold py-3 px-6 rounded-lg
              hover:bg-gray-900 transition duration-200 w-full"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Page
