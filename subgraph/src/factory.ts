import { PairCreated } from "../generated/AMMFactory/AMMFactory";
import { AMMPairTemplate } from "../generated/templates";

export function handlePairCreated(event: PairCreated): void {
  let pairAddress = event.params.pair;
  AMMPairTemplate.create(pairAddress);
}