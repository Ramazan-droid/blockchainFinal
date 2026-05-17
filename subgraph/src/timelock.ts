import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CallScheduled, CallExecuted, Cancelled } from "../generated/TimeLock/TimeLock";
import { TimelockCall } from "../generated/schema";

export function handleCallScheduled(event: CallScheduled): void {
  let id = event.params.id.toHexString();
  let timelockCall = new TimelockCall(id);
  
  timelockCall.target = event.params.target;
  timelockCall.value = event.params.value;
  timelockCall.data = event.params.data;
  timelockCall.predecessor = event.params.predecessor;
  timelockCall.delay = event.params.delay;
  timelockCall.eta = event.block.timestamp.plus(event.params.delay);
  timelockCall.isExecuted = false;
  timelockCall.isCanceled = false;
  timelockCall.save();
}

export function handleCallExecuted(event: CallExecuted): void {
  let id = event.params.id.toHexString();
  let timelockCall = TimelockCall.load(id);
  if (timelockCall) {
    timelockCall.isExecuted = true;
    timelockCall.save();
  }
}

export function handleCancelled(event: Cancelled): void {
  let id = event.params.id.toHexString();
  let timelockCall = TimelockCall.load(id);
  if (timelockCall) {
    timelockCall.isCanceled = true;
    timelockCall.save();
  }
}