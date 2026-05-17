import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Transfer, DelegateChanged, DelegateVotesChanged } from "../generated/GovToken/GovToken";
import { TokenHolder, Delegate } from "../generated/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: Transfer): void {
  let fromId = event.params.from.toHexString();
  let toId = event.params.to.toHexString();
  let value = event.params.value;

  if (fromId != ZERO_ADDRESS) {
    let holderFrom = TokenHolder.load(fromId);
    if (holderFrom) {
      holderFrom.balance = holderFrom.balance.minus(value);
      holderFrom.save();
    }
  }

  let holderTo = TokenHolder.load(toId);
  if (!holderTo) {
    holderTo = new TokenHolder(toId);
    holderTo.balance = BigInt.fromI32(0);
  }
  holderTo.balance = holderTo.balance.plus(value);
  holderTo.save();
}

export function handleDelegateChanged(event: DelegateChanged): void {
  let holderId = event.params.delegator.toHexString();
  let delegateId = event.params.toDelegate.toHexString();

  let holder = TokenHolder.load(holderId);
  if (!holder) {
    holder = new TokenHolder(holderId);
    holder.balance = BigInt.fromI32(0);
  }
  holder.delegate = delegateId;
  holder.save();

  let delegate = Delegate.load(delegateId);
  if (!delegate) {
    delegate = new Delegate(delegateId);
    delegate.votingPower = BigInt.fromI32(0);
    delegate.save();
  }
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  let delegateId = event.params.delegate.toHexString();
  let delegate = Delegate.load(delegateId);
  if (!delegate) {
    delegate = new Delegate(delegateId);
  }
  delegate.votingPower = event.params.newVotes;
  delegate.save();
}