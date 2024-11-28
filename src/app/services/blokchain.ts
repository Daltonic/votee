import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from '@solana/web3.js'
import { Votee } from '../../../anchor/target/types/votee'
import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import idl from '../../../anchor/target/idl/votee.json'
import { Candidate, Poll } from '../utils/interfaces'
import { globalActions } from '../store/globalSlices'
import { store } from '../store'

let tx: any
const programId: PublicKey = new PublicKey(idl.address)
const RPC_URL: string =
  process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'
const { setPoll, setCandidates } = globalActions

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Votee> | null => {
  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected or missing signTransaction.')
    return null
  }

  const connection = new Connection(RPC_URL, 'confirmed')
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed' }
  )

  return new Program<Votee>(idl as any, provider)
}

export const getReadOnlyProvider = (): Program<Votee> => {
  const connection = new Connection(RPC_URL, 'confirmed')

  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
    signAllTransactions: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
  }

  const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {
    commitment: 'processed',
  })

  return new Program<Votee>(idl as any, provider)
}

export const initialize = async (
  program: Program<Votee>,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )

  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  tx = await program.methods
    .initialize()
    .accountsPartial({
      user: publicKey,
      counter: counterPda,
      registerations: registerationsPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const getCounter = async (program: Program<Votee>): Promise<BN> => {
  try {
    const [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      programId
    )

    const counter = await program.account.counter.fetch(counterPda)

    if (!counter) {
      console.warn('No counter found, returning zero')
      return new BN(-1)
    }

    return counter.count
  } catch (error) {
    console.error('Failed to retrieve counter:', error)
    return new BN(-1)
  }
}

export const createPoll = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  nextCount: BN,
  description: string,
  start: number,
  end: number
): Promise<TransactionSignature> => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )

  const [pollPda] = PublicKey.findProgramAddressSync(
    [nextCount.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const startBN = new BN(start)
  const endBN = new BN(end)

  tx = await program.methods
    .createPoll(description, startBN, endBN)
    .accountsPartial({
      user: publicKey,
      counter: counterPda,
      poll: pollPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const registerCandidate = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  name: string
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  const regs = await program.account.registerations.fetch(registerationsPda)
  const CID = regs.count.add(new BN(1))

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  tx = await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      registerations: registerationsPda,
      candidate: candidatePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const vote = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const CID = new BN(candidateId)

  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const [voterPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('voter'),
      PID.toArrayLike(Buffer, 'le', 8),
      publicKey.toBuffer(),
    ],
    programId
  )

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  tx = await program.methods
    .vote(PID, CID)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      candidate: candidatePda,
      voter: voterPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const fetchAllPolls = async (
  program: Program<Votee>
): Promise<Poll[]> => {
  const polls = await program.account.poll.all()
  return serializedPoll(polls)
}

export const fetchPollDetails = async (
  program: Program<Votee>,
  pollAddress: string
): Promise<Poll> => {
  const poll = await program.account.poll.fetch(pollAddress)
  const serialized: Poll = {
    ...poll,
    publicKey: pollAddress,
    id: poll.id.toNumber(),
    start: poll.start.toNumber() * 1000,
    end: poll.end.toNumber() * 1000,
    candidates: poll.candidates.toNumber(),
  }

  store.dispatch(setPoll(serialized))
  return serialized
}

const serializedPoll = (polls: any[]): Poll[] =>
  polls.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    id: c.account.id.toNumber(),
    start: c.account.start.toNumber() * 1000,
    end: c.account.end.toNumber() * 1000,
    candidates: c.account.candidates.toNumber(),
  }))

export const fetchAllCandidates = async (
  program: Program<Votee>,
  pollAdress: string
): Promise<Candidate[]> => {
  const poll = await fetchPollDetails(program, pollAdress)
  if (!poll) return []

  const PID = new BN(poll.id)

  const candidatesData = await program.account.candidate.all()
  const candidates = candidatesData.filter((candidate) => {
    return candidate.account.pollId.eq(PID)
  })

  store.dispatch(setCandidates(serializedCandidates(candidates)))

  return serializedCandidates(candidates)
}

const serializedCandidates = (candidates: any[]): Candidate[] =>
  candidates.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    cid: c.account.cid.toNumber(),
    pollId: c.account.pollId.toNumber(),
    votes: c.account.votes.toNumber(),
  }))

export const hasUserVoted = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number
): Promise<boolean> => {
  const PID = new BN(pollId)

  const [voterPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('voter'),
      PID.toArrayLike(Buffer, 'le', 8),
      publicKey.toBuffer(),
    ],
    programId
  )

  try {
    const voter = await program.account.voter.fetch(voterPda)
    if (!voter || !voter.hasVoted) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error fetching voter account:', error)
    return false
  }
}
