import { onchainTable } from "ponder";

export const trade = onchainTable("trade", (t) => ({
  id: t.text().primaryKey(),
  hash: t.hex().notNull(), block: t.bigint().notNull(), timestamp: t.bigint().notNull(),
  router: t.hex(), amount0: t.bigint().notNull(), amount1: t.bigint().notNull(), direction: t.text().notNull(),
  sqrtPriceX96: t.bigint().notNull(), tick: t.integer().notNull(), ticketId: t.bigint(), player: t.hex(),
}));

export const ticket = onchainTable("ticket", (t) => ({
  id: t.text().primaryKey(), ticketId: t.bigint().notNull(), poolId: t.hex().notNull(), player: t.hex().notNull(),
  currency: t.hex().notNull(), fee: t.bigint().notNull(), issuedTx: t.hex().notNull(), issuedBlock: t.bigint().notNull(), drawableFrom: t.bigint().notNull(),
  expiresAfter: t.bigint().notNull(), drawn: t.boolean().notNull(), roll: t.bigint(), payoutEth: t.bigint(), payoutIce: t.bigint(),
}));

export const tankFill = onchainTable("tankFill", (t) => ({
  id: t.text().primaryKey(), tx: t.hex().notNull(), block: t.bigint().notNull(), timestamp: t.bigint().notNull(),
  poolId: t.hex().notNull(), player: t.hex().notNull(), pees: t.bigint().notNull(), iceAdded: t.bigint().notNull(),
}));

export const potSnapshot = onchainTable("potSnapshot", (t) => ({
  id: t.text().primaryKey(), block: t.bigint().notNull(), eth: t.bigint().notNull(), ice: t.bigint().notNull(),
}));

export const player = onchainTable("player", (t) => ({
  address: t.hex().primaryKey(), tickets: t.bigint().notNull(), totalFees: t.bigint().notNull(), totalPayouts: t.bigint().notNull(),
}));

export const dailyVolume = onchainTable("dailyVolume", (t) => ({
  day: t.text().primaryKey(), ethVolume: t.bigint().notNull(), iceVolume: t.bigint().notNull(), trades: t.bigint().notNull(),
}));
