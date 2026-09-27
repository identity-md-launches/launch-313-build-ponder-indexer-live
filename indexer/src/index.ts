import { ponder } from "ponder:registry";
import { eq } from "ponder";
import { dailyVolume, player, potSnapshot, tankFill, ticket, trade } from "ponder:schema";
import { JackpotHookAbi as hookAbi } from "../abi/JackpotHook.js";

const hook = (process.env.JACKPOT_HOOK_ADDRESS ?? "0xd08e759d3d89eed2de3f03006a6e21ae341d4088") as `0x${string}`;
const poolIdConfig = (process.env.POOL_ID ?? "0x8a4279952ebfdc5be1698760df0bdd8f7643720415c0244cff84acf64a3249df") as `0x${string}`;
const icePerPee = 10n * 10n ** 18n;

async function snapshot(event: any, context: any) {
  const [eth, ice] = await context.client.readContract({
    address: hook,
    abi: hookAbi,
    functionName: "pots",
    args: [poolIdConfig],
    blockNumber: event.block.number,
  });
  await context.db.insert(potSnapshot).values({
    id: `${event.block.number}`, block: event.block.number, eth, ice,
  }).onConflictDoUpdate({ eth, ice });
}

async function touchPlayer(context: any, address: `0x${string}`, values: { tickets?: bigint; fees?: bigint; payouts?: bigint } = {}) {
  await context.db.insert(player).values({
    address, tickets: values.tickets ?? 0n, totalFees: values.fees ?? 0n, totalPayouts: values.payouts ?? 0n,
  }).onConflictDoUpdate((row: any) => ({
    tickets: values.tickets ? row.tickets + values.tickets : row.tickets,
    totalFees: values.fees ? row.totalFees + values.fees : row.totalFees,
    totalPayouts: values.payouts ? row.totalPayouts + values.payouts : row.totalPayouts,
  }));
}

ponder.on("JackpotHook:TicketIssued", async ({ event, context }) => {
  const { poolId, ticketId, player: owner, currency, fee, blockNumber } = event.args;
  if (poolId.toLowerCase() !== poolIdConfig.toLowerCase()) return;
  await context.db.insert(ticket).values({
    id: `${poolId}-${ticketId}`, ticketId, poolId, player: owner, currency, fee, issuedTx: event.transaction.hash,
    issuedBlock: blockNumber, drawableFrom: blockNumber + 2n, expiresAfter: blockNumber + 256n,
    drawn: false,
  });
  await touchPlayer(context, owner, { tickets: 1n, fees: fee });
  await context.db.update(trade, { id: event.transaction.hash }).set({ ticketId, player: owner });
  await snapshot(event, context);
});

ponder.on("JackpotHook:Drawn", async ({ event, context }) => {
  const { poolId, ticketId, player: owner, roll, payoutEth, payoutIce } = event.args;
  if (poolId.toLowerCase() !== poolIdConfig.toLowerCase()) return;
  await context.db.update(ticket, { id: `${poolId}-${ticketId}` }).set({ drawn: true, roll, payoutEth, payoutIce });
  await touchPlayer(context, owner, { payouts: payoutEth + payoutIce });
  await snapshot(event, context);
});

ponder.on("JackpotHook:TankFilled", async ({ event, context }) => {
  const { poolId, player: owner, pees } = event.args;
  if (poolId.toLowerCase() !== poolIdConfig.toLowerCase()) return;
  await context.db.insert(tankFill).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`, tx: event.transaction.hash, block: event.block.number, timestamp: event.block.timestamp,
    poolId, player: owner, pees, iceAdded: pees * icePerPee,
  });
  await touchPlayer(context, owner);
  await snapshot(event, context);
});

ponder.on("PoolManager:Swap", async ({ event, context }) => {
  if (event.args.id.toLowerCase() !== poolIdConfig.toLowerCase()) return;
  const amount0 = BigInt(event.args.amount0);
  const amount1 = BigInt(event.args.amount1);
  const id = event.transaction.hash;
  const isInternal = event.args.sender.toLowerCase() === hook.toLowerCase();
  if (isInternal) {
    await context.db.insert(trade).values({
      id, hash: id, block: event.block.number, timestamp: event.block.timestamp, router: null,
      amount0, amount1, direction: amount0 > 0n ? "0to1" : "1to0",
      sqrtPriceX96: event.args.sqrtPriceX96, tick: event.args.tick,
    }).onConflictDoUpdate({ amount0, amount1, sqrtPriceX96: event.args.sqrtPriceX96, tick: event.args.tick });
    const issued = await context.db.sql.select().from(ticket).where(eq(ticket.issuedTx, id)).limit(1);
    if (issued[0]) await context.db.update(trade, { id }).set({ ticketId: issued[0].ticketId, player: issued[0].player });
    const day = String(Number(event.block.timestamp) / 86400 | 0);
    await context.db.insert(dailyVolume).values({
      day, ethVolume: amount0 < 0n ? -amount0 : amount0, iceVolume: amount1 < 0n ? -amount1 : amount1, trades: 1n,
    }).onConflictDoUpdate((row: any) => ({
      ethVolume: row.ethVolume + (amount0 < 0n ? -amount0 : amount0),
      iceVolume: row.iceVolume + (amount1 < 0n ? -amount1 : amount1),
      trades: row.trades + 1n,
    }));
  } else {
    await context.db.update(trade, { id }).set({ router: event.args.sender });
  }
});
