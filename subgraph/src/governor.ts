import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalCreated,
  ProposalQueued,
  ProposalExecuted,
  ProposalCanceled,
  VoteCast,
  VoteCastWithParams
} from "../generated/MyGovernor/MyGovernor";
import { Proposal, Vote, Delegate } from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
  let proposalId = event.params.proposalId.toString();
  let proposal = new Proposal(proposalId);
  
  let proposerId = event.params.proposer.toHexString();
  let delegate = Delegate.load(proposerId);
  if (!delegate) {
    delegate = new Delegate(proposerId);
    delegate.votingPower = BigInt.fromI32(0);
    delegate.save();
  }

  proposal.proposer = proposerId;
  
  // Transform types for Web3 Arrays
  let targets = event.params.targets;
  let targetBytes: Bytes[] = [];
  for (let i = 0; i < targets.length; i++) {
    targetBytes.push(targets[i]);
  }
  proposal.targets = targetBytes;
  proposal.values = event.params.values;
  proposal.signatures = event.params.signatures;
  proposal.calldatas = event.params.calldatas;
  proposal.startBlock = event.params.voteStart;
  proposal.endBlock = event.params.voteEnd;
  proposal.description = event.params.description;
  proposal.status = "ACTIVE";
  
  proposal.forVotes = BigInt.fromI32(0);
  proposal.againstVotes = BigInt.fromI32(0);
  proposal.abstainVotes = BigInt.fromI32(0);
  proposal.save();
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    proposal.status = "QUEUED";
    proposal.eta = event.params.eta;
    proposal.save();
  }
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    proposal.status = "EXECUTED";
    proposal.save();
  }
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    proposal.status = "CANCELED";
    proposal.save();
  }
}

export function handleVoteCast(event: VoteCast): void {
  let proposalId = event.params.proposalId.toString();
  let voterId = event.params.voter.toHexString();
  let voteId = voterId + "-" + proposalId;
  
  let vote = new Vote(voteId);
  vote.proposal = proposalId;
  vote.voter = voterId;
  vote.weight = event.params.weight;
  vote.support = event.params.support;
  vote.reason = event.params.reason;
  vote.save();

  let proposal = Proposal.load(proposalId);
  if (proposal) {
    if (event.params.support == 0) {
      proposal.againstVotes = proposal.againstVotes.plus(event.params.weight);
    } else if (event.params.support == 1) {
      proposal.forVotes = proposal.forVotes.plus(event.params.weight);
    } else if (event.params.support == 2) {
      proposal.abstainVotes = proposal.abstainVotes.plus(event.params.weight);
    }
    proposal.save();
  }
}

export function handleVoteCastWithParams(event: VoteCastWithParams): void {
  let proposalId = event.params.proposalId.toString();
  let voterId = event.params.voter.toHexString();
  let voteId = voterId + "-" + proposalId;
  
  let vote = new Vote(voteId);
  vote.proposal = proposalId;
  vote.voter = voterId;
  vote.weight = event.params.weight;
  vote.support = event.params.support;
  vote.reason = event.params.reason; // Params can be unpacked if your strategy needs it
  vote.save();

  let proposal = Proposal.load(proposalId);
  if (proposal) {
    if (event.params.support == 0) {
      proposal.againstVotes = proposal.againstVotes.plus(event.params.weight);
    } else if (event.params.support == 1) {
      proposal.forVotes = proposal.forVotes.plus(event.params.weight);
    } else if (event.params.support == 2) {
      proposal.abstainVotes = proposal.abstainVotes.plus(event.params.weight);
    }
    proposal.save();
  }
}