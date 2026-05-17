import { BigInt } from "@graphprotocol/graph-ts";
import {
  AddLiquidityCall,
  Swap0To1Call,
  Swap1To0Call
} from "../generated/AMMPair/AMMPair";
import { AMMPool, AMMPosition } from "../generated/schema";

function getOrCreateAMMPool(address: string): AMMPool {
  let pool = AMMPool.load(address);
  if (!pool) {
    pool = new AMMPool(address);
    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalSupplyLP = BigInt.fromI32(0);
  }
  return pool;
}

function getOrCreateAMMPosition(poolAddress: string, userAddress: string): AMMPosition {
  let id = poolAddress + "-" + userAddress;
  let position = AMMPosition.load(id);
  if (!position) {
    position = new AMMPosition(id);
    position.pool = poolAddress;
    position.lpBalance = BigInt.fromI32(0);
  }
  return position;
}

export function handleAddLiquidityCall(call: AddLiquidityCall): void {
  let pool = getOrCreateAMMPool(call.to.toHexString());
  let liquidityAdded = call.inputs.amount0.plus(call.inputs.amount1);

  pool.reserve0 = pool.reserve0.plus(call.inputs.amount0);
  pool.reserve1 = pool.reserve1.plus(call.inputs.amount1);
  pool.totalSupplyLP = pool.totalSupplyLP.plus(liquidityAdded);
  pool.save();

  let position = getOrCreateAMMPosition(call.to.toHexString(), call.from.toHexString());
  position.lpBalance = position.lpBalance.plus(liquidityAdded);
  position.save();
}

export function handleSwap0To1Call(call: Swap0To1Call): void {
  let pool = getOrCreateAMMPool(call.to.toHexString());
  let amountIn = call.inputs.amountIn;
  
  // Track math exactly matching contract updates: amountInWithFee = (amountIn * 997) / 1000
  let amountInWithFee = amountIn.times(BigInt.fromI32(997)).div(BigInt.fromI32(1000));
  let amountOut = amountInWithFee.times(pool.reserve1).div(pool.reserve0.plus(amountInWithFee));

  pool.reserve0 = pool.reserve0.plus(amountIn);
  pool.reserve1 = pool.reserve1.minus(amountOut);
  pool.save();
}

export function handleSwap1To0Call(call: Swap1To0Call): void {
  let pool = getOrCreateAMMPool(call.to.toHexString());
  let amountIn = call.inputs.amountIn;
  
  let amountInWithFee = amountIn.times(BigInt.fromI32(997)).div(BigInt.fromI32(1000));
  let amountOut = amountInWithFee.times(pool.reserve0).div(pool.reserve1.plus(amountInWithFee));

  pool.reserve1 = pool.reserve1.plus(amountIn);
  pool.reserve0 = pool.reserve0.minus(amountOut);
  pool.save();
}