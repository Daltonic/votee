#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("39iYECXn1q87xKCTdAGgbADtbcByTC4qdW8bkWH43evt");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod votee {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;

        let registerations = &mut ctx.accounts.registerations;
        registerations.count = 0;
        Ok(())
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        description: String,
        start: u64,
        end: u64,
    ) -> Result<()> {
        if start >= end {
            return Err(ErrorCode::InvalidDates.into());
        }

        let counter = &mut ctx.accounts.counter;
        counter.count += 1;

        let poll = &mut ctx.accounts.poll;

        poll.id = counter.count;
        poll.description = description;
        poll.start = start;
        poll.end = end;
        poll.candidates = 0;
        Ok(())
    }

    pub fn register_candidate(
        ctx: Context<RegisterCandidate>,
        poll_id: u64,
        name: String,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        if poll.id != poll_id {
            return Err(ErrorCode::PollDoesNotExist.into());
        }

        let candidate = &mut ctx.accounts.candidate;
        if candidate.has_registered {
            return Err(ErrorCode::CandidateAlreadyRegistered.into());
        }

        let registerations = &mut ctx.accounts.registerations;
        registerations.count += 1;

        candidate.has_registered = true;
        candidate.cid = registerations.count;
        candidate.poll_id = poll_id;
        candidate.name = name;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, poll_id: u64, cid: u64) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        let candidate = &mut ctx.accounts.candidate;
        let poll = &mut ctx.accounts.poll;

        if !candidate.has_registered || candidate.poll_id != poll_id {
            return Err(ErrorCode::CandidateNotRegistered.into());
        }

        if voter.has_voted {
            return Err(ErrorCode::VoterAlreadyVoted.into());
        }

        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        if current_timestamp < poll.start || current_timestamp > poll.end {
            return Err(ErrorCode::PollNotActive.into());
        }

        voter.poll_id = poll_id;
        voter.cid = cid;
        voter.has_voted = true;

        candidate.votes += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE,
        seeds = [(counter.count + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + 8,
      seeds = [b"counter"],
      bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + 8,
      seeds = [b"registerations"],
      bump
    )]
    pub registerations: Account<'info, Registerations>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[account]
pub struct Registerations {
    pub count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub cid: u64,
    pub poll_id: u64,
    #[max_len(32)]
    pub name: String,
    pub votes: u64,
    pub has_registered: bool,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct RegisterCandidate<'info> {
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init, // Create the voter account if it doesn't exist
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Candidate::INIT_SPACE, // Account size
        seeds = [
            poll_id.to_le_bytes().as_ref(),
            (registerations.count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, // Modify the `registerations` account
    )]
    pub registerations: Account<'info, Registerations>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Voter {
    pub cid: u64,
    pub poll_id: u64,
    pub has_voted: bool,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, cid: u64)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>, // Poll to be voted in

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), cid.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>, // Candidate to receive the vote

    #[account(
        init, // Create the voter account if it doesn't exist
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 25, // Account size
        seeds = [b"voter", poll_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>, // Unique per poll and user

    #[account(mut)]
    pub user: Signer<'info>, // Voter's signer account

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    #[max_len(280)]
    pub description: String,
    pub start: u64,
    pub end: u64,
    pub candidates: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Poll counter cannot be less than zero")]
    PollCounterUnderflow,
    #[msg("Voter cannot vote twice")]
    VoterAlreadyVoted,
    #[msg("Candidate cannot register twice")]
    CandidateAlreadyRegistered,
    #[msg("Start date cannot be greater than end date")]
    InvalidDates,
    #[msg("Candidate is not in the poll")]
    CandidateNotRegistered,
    #[msg("Poll not currently active")]
    PollNotActive,
    #[msg("Poll does not exist or not found")]
    PollDoesNotExist,
}
