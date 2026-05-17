import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { PriceOracle } from "../generated/PriceOracle/PriceOracle";
import { OracleConfiguration, PriceRecord } from "../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromI32(100)).equals(BigInt.fromI32(0))) {
    
    let oracleAddress = Address.fromString("0xaB67c7965230E1b18907275565A160F32a32d474");
    let contract = PriceOracle.bind(oracleAddress);
    
    let config = OracleConfiguration.load(oracleAddress.toHexString());
    if (!config) {
      config = new OracleConfiguration(oracleAddress.toHexString());
      
      let priceFeedCall = contract.try_priceFeed();
      if (!priceFeedCall.reverted) {
        config.priceFeed = priceFeedCall.value;
      }
      
      let maxDelayCall = contract.try_maxDelay();
      if (!maxDelayCall.reverted) {
        config.maxDelay = maxDelayCall.value;
      }
      config.save();
    }

    let priceCall = contract.try_getPrice();
    if (!priceCall.reverted) {
      let recordId = block.number.toString();
      let priceRecord = new PriceRecord(recordId);
      
      priceRecord.price = priceCall.value;
      priceRecord.timestamp = block.timestamp;
      priceRecord.blockNumber = block.number;
      priceRecord.save();
    }
  }
}