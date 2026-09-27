# Pepes Armed With AI — Sepolia Ponder indexer

This indexer follows the live launch-183 pool on Sepolia. The chain id, addresses, and starting block are configuration values with defaults in `ponder.config.ts`:

- `PONDER_RPC_URL_11155111` (default: `https://ethereum-sepolia.gateway.tatum.io`)
- `JACKPOT_HOOK_ADDRESS` (default: `0xd08e759d3d89eed2de3f03006a6e21ae341d4088`)
- `POOL_MANAGER_ADDRESS` (default: `0xE03A1074c86CFeDd5C142C4F04F1a1536e203543`)
- `POOL_ID` (default: `0x8a4279952ebfdc5be1698760df0bdd8f7643720415c0244cff84acf64a3249df`)
- `JACKPOT_START_BLOCK` (default: `11782139`)

The documented endpoint is public and rate-limited. Other public Sepolia choices include `https://sepolia.rpc.sentio.xyz`, `https://ethereum-sepolia-public.nodies.app`, and `https://ethereum-sepolia-rpc.publicnode.com`. If event totals disagree, re-sync with a different operator before treating the difference as chain data.

## Run

```sh
npm install
export PONDER_RPC_URL_11155111=https://ethereum-sepolia.gateway.tatum.io
npm run dev       # GraphQL: http://localhost:42069/graphql
```

`npm run start` runs the production server. `npm run check` runs TypeScript after `ponder codegen` has generated the registry types.

## GraphQL examples

Undrawn tickets, including the block window needed to determine whether each is drawable at the latest indexed block (read `_meta.status` in the same response and compare it with `drawableFrom`/`expiresAfter`):

```graphql
query Undrawn {
  tickets(where: { drawn: false }, limit: 100) { items { ticketId player drawableFrom expiresAfter } }
  _meta { status }
}
```

One player's tickets and payouts:

```graphql
query PlayerTickets($player: String!) {
  tickets(where: { player: $player }, limit: 100) { items { ticketId fee drawn payoutEth payoutIce } }
  player(address: $player) { tickets totalFees totalPayouts }
}
```

Trades, including the internal amounts and router:

```graphql
{ trades(orderBy: "block", orderDirection: "desc", limit: 20) { items { hash router amount0 amount1 direction ticketId } } }
```

Tank fills and ICE added:

```graphql
{ tankFills(orderBy: "block", orderDirection: "desc", limit: 20) { items { tx player pees iceAdded } } }
```

Daily ETH and ICE volume from internal swaps only:

```graphql
{ dailyVolumes(orderBy: "day", orderDirection: "desc", limit: 30) { items { day ethVolume iceVolume trades } } }
```

Latest pot snapshot:

```graphql
{ potSnapshots(orderBy: "block", orderDirection: "desc", limit: 1) { items { block eth ice } } }
```

Every event emitted by `JackpotHook.json` that changes the reported state is indexed. `pots(poolId)` is read at each hook-event block to make the pot history queryable. PoolManager `Swap` events are filtered to this pool; the hook-sender swap is the real volume and the router-sender zero swap only supplies the router. No unrelated pools or non-state-changing function calls are indexed.
