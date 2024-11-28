#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
#[allow(unused_imports)]
use states::*;

declare_id!("AZCAmomVF6WczUNUtwJUtstHp14zG5GipfXpy6m8RWPs");

#[program]
pub mod votee {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        description: String,
        start: u64,
        end: u64,
    ) -> Result<()> {
        instructions::create_poll(ctx, description, start, end)
    }

    pub fn register_candidate(
        ctx: Context<RegisterCandidate>,
        poll_id: u64,
        name: String,
    ) -> Result<()> {
        instructions::register_candidate(ctx, poll_id, name)
    }

    pub fn vote(ctx: Context<Vote>, poll_id: u64, cid: u64) -> Result<()> {
        instructions::vote(ctx, poll_id, cid)
    }
}
