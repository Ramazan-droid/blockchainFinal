import { BigInt } from "@graphprotocol/graph-ts";
import {
  DepositCall,
  BorrowCall,
  RepayCall,
  LiquidateCall
} from "../generated/LendingPool/LendingPool";
import { LendingUser } from "../generated/schema";

function getOrCreateLendingUser(address: string): LendingUser {
  let user = LendingUser.load(address);
  if (!user) {
    user = new LendingUser(address);
    user.collateral = BigInt.fromI32(0);
    user.debt = BigInt.fromI32(0);
  }
  return user;
}

export function handleDepositCall(call: DepositCall): void {
  let user = getOrCreateLendingUser(call.from.toHexString());
  user.collateral = user.collateral.plus(call.inputs.amount);
  user.save();
}

export function handleBorrowCall(call: BorrowCall): void {
  let user = getOrCreateLendingUser(call.from.toHexString());
  user.debt = user.debt.plus(call.inputs.amount);
  user.save();
}

export function handleRepayCall(call: RepayCall): void {
  let user = getOrCreateLendingUser(call.from.toHexString());
  user.debt = user.debt.minus(call.inputs.amount);
  user.save();
}

export function handleLiquidateCall(call: LiquidateCall): void {
  let targetUser = getOrCreateLendingUser(call.inputs.user.toHexString());
  
  // The provided implementation subtracts the repay amount directly from both variables
  targetUser.debt = targetUser.debt.minus(call.inputs.repayAmount);
  targetUser.collateral = targetUser.collateral.minus(call.inputs.repayAmount);
  targetUser.save();
}