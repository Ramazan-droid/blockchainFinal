import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { PriceOracle } from "../generated/PriceOracle/PriceOracle";
import { OracleConfiguration, PriceRecord } from "../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  // Check every 100 blocks
  if (block.number.mod(BigInt.fromI32(100)).equals(BigInt.fromI32(0))) {
    
    let oracleAddress = Address.fromString("0xab67c7965230e1b18907275565a160f32a32d474");
    let contract = PriceOracle.bind(oracleAddress);
    
    let config = OracleConfiguration.load(oracleAddress.toHexString());
    if (!config) {
      let priceFeedCall = contract.try_priceFeed();
      let maxDelayCall = contract.try_maxDelay();
      
      // CRITICAL: Only create and save the entity if the contract successfully responded
      if (!priceFeedCall.reverted && priceFeedCall.value.toHexString() != "0x0000000000000000000000000000000000000000") {
        config = new OracleConfiguration(oracleAddress.toHexString());
        config.priceFeed = priceFeedCall.value;
        config.maxDelay = !maxDelayCall.reverted ? maxDelayCall.value : BigInt.fromI32(3600);
        config.save();
      } else {
        // Contract isn't active or returns zero bytes at this block; skip safely.
        return;
      }
    }

    // Safe call to getPrice()
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