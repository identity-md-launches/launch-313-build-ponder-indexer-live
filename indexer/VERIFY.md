# Verification

Synced from block `11782139` to Sepolia head `11791455` on 2026-09-27 with Ponder 0.17.12. The first endpoint (`ethereum-sepolia.gateway.tatum.io`) stalled on the historical range; the sync was restarted against the independent publicnode endpoint documented in the README.

GraphQL endpoint: `http://localhost:42069/graphql`

Query:

```graphql
{
  tickets(limit: 100) { items { ticketId player drawn drawableFrom expiresAfter } pageInfo { hasNextPage } }
  tankFills(limit: 100) { items { tx player pees iceAdded } }
  trades(limit: 100) { items { hash router amount0 amount1 ticketId player } }
  potSnapshots(orderBy: "block", orderDirection: "desc", limit: 1) { items { block eth ice } }
  players(limit: 100) { items { address tickets totalFees totalPayouts } }
  dailyVolumes(limit: 100) { items { day ethVolume iceVolume trades } }
  _meta { status }
}
```

Output summary:

```text
_meta.sepolia.block.number = 11791447
tickets = 5, all drawn = false, hasNextPage = false
tankFills = 3
trades = 5 (each has one internal non-zero swap and one ignored zero outer swap)
PoolManager:Swap events seen = 10 (the source is filtered to this pool)
potSnapshots.latest = block 11790503, eth 160000000000000, ice 20102000000000000000000
drawn events = 0
```

The five ticket IDs were `0` through `4`; the five trades each have a router and a ticket/player association. This agrees with the supplied checkpoint (5 trades, 10 Swap events, 5 TicketIssued, 3 TankFilled, 0 Drawn by block 11790576) and includes later indexed blocks through the observed head.
