# Votee

Votee is a simple, decentralized voting application built on Solana. Create polls, register candidates, and cast votes — all on-chain, with a clean Next.js frontend and a Solana wallet.

Whether you're running a community decision, a team poll, or just experimenting with on-chain programs, Votee makes it quick and straightforward.

## What Votee lets you do

- **Create polls** — Set a description, start time, and end time for your poll.
- **Register candidates** — Add candidates to any poll.
- **Vote** — Cast your vote for a candidate (one vote per person per poll).
- **View live results** — See poll details and candidate vote counts in real time.
- **Connect your wallet** — Phantom and Solflare support via the Solana Wallet Adapter.

## How it works

Votee is split into two parts:

### On-chain program (Anchor / Rust)

The smart contract lives under `anchor/programs/votee` and handles all voting logic:

| Instruction | What it does |
|-------------|--------------|
| `initialize` | Sets up the counter and registration accounts. |
| `create_poll` | Creates a new poll with a description and start/end times. |
| `register_candidate` | Registers a candidate for a specific poll. |
| `vote` | Lets a connected voter cast a single vote for a candidate. |

The program keeps track of polls, candidates, and voters using PDA (Program Derived Address) accounts, so everything is stored and verified on-chain.

### Frontend (Next.js + Tailwind)

The web app under `src/app` lets anyone interact with the program through a browser:

- `/` — Browse all polls and initialize the app.
- `/create` — Create a new poll.
- `/polls/[pollId]` — View a poll, register candidates, and vote.

It uses:

- **Next.js 14** with the App Router
- **Tailwind CSS** + **DaisyUI** for styling
- **Solana Wallet Adapter** (Phantom, Solflare)
- **@coral-xyz/anchor** to talk to the on-chain program
- **Redux Toolkit** for client state
- **TanStack Query** for data fetching

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 recommended)
- [pnpm](https://pnpm.io/)
- [Anchor CLI](https://www.anchor-lang.com/) (v0.30.1) and the Solana toolchain — only if you want to build or test the on-chain program
- A Solana wallet (Phantom or Solflare) for the frontend

### 1. Clone the repo

```bash
git clone https://github.com/Daltonic/votee.git
cd votee
```

### 2. Install frontend dependencies

```bash
pnpm install
```

### 3. Set up environment

Create a `.env` file in the root:

```bash
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8899
# For devnet:
# NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### 4. Run the on-chain program (localnet)

If you want to run the Anchor program locally:

```bash
# Start a local Solana validator
solana-test-validator

# In another terminal, build and deploy the program
pnpm run anchor-build
pnpm run anchor-localnet
pnpm run anchor-test
```

Or run the Anchor test suite directly:

```bash
pnpm run anchor-test
```

### 5. Run the frontend

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser, connect your wallet, and you're ready to create and vote in polls.

## Project structure

```
votee/
├── anchor/                      # On-chain Solana program (Anchor / Rust)
│   ├── programs/votee/src/
│   │   ├── instructions/        # initialize, create_poll, register_candidate, vote
│   │   ├── states/              # Poll, Candidate, Voter, Counter, Registerations
│   │   ├── errors/              # Program error codes
│   │   └── lib.rs               # Program entry point
│   └── tests/                   # Anchor integration tests
├── src/app/                     # Next.js frontend (App Router)
│   ├── page.tsx                 # Home – list of polls
│   ├── create/page.tsx          # Create a new poll
│   ├── polls/[pollId]/page.tsx  # Poll details, register & vote
│   ├── services/blockchain.service.tsx  # Anchor provider & RPC helpers
│   ├── components/              # Wallet provider, header, candidate list, etc.
│   └── store/                   # Redux state
├── .github/workflows/           # CI: test & build web and anchor
├── screenshots/                 # Project screenshots / UML diagram
├── package.json
└── README.md
```

## Testing

- **Anchor program tests**: `pnpm run anchor-test`
- **Frontend build**: `pnpm build`

Both are also run automatically via GitHub Actions on every push and pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Built with ❤️ on Solana.