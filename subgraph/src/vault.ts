import { BigInt } from "@graphprotocol/graph-ts";
import { Deposit, Withdraw } from "../generated/SimpleVault/SimpleVault";
import { Vault, VaultUser } from "../generated/schema";

function getOrCreateVault(address: string): Vault {
  let vault = Vault.load(address);
  if (!vault) {
    vault = new Vault(address);
    vault.totalSupplyShares = BigInt.fromI32(0);
  }
  return vault;
}

function getOrCreateVaultUser(vaultAddress: string, userAddress: string): VaultUser {
  let id = vaultAddress + "-" + userAddress;
  let user = VaultUser.load(id);
  if (!user) {
    user = new VaultUser(id);
    user.vault = vaultAddress;
    user.shares = BigInt.fromI32(0);
  }
  return user;
}

export function handleVaultDeposit(event: Deposit): void {
  let vault = getOrCreateVault(event.address.toHexString());
  vault.totalSupplyShares = vault.totalSupplyShares.plus(event.params.shares);
  vault.save();

  let user = getOrCreateVaultUser(event.address.toHexString(), event.params.owner.toHexString());
  user.shares = user.shares.plus(event.params.shares);
  user.save();
}

export function handleVaultWithdraw(event: Withdraw): void {
  let vault = getOrCreateVault(event.address.toHexString());
  vault.totalSupplyShares = vault.totalSupplyShares.minus(event.params.shares);
  vault.save();

  let user = getOrCreateVaultUser(event.address.toHexString(), event.params.owner.toHexString());
  user.shares = user.shares.minus(event.params.shares);
  user.save();
}