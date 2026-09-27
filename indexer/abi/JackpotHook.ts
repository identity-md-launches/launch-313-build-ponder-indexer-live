export const JackpotHookAbi = [
  { type: "function", name: "pots", stateMutability: "view", inputs: [{ name: "id", type: "bytes32" }], outputs: [{ name: "eth", type: "uint256" }, { name: "ice", type: "uint256" }] },
  { type: "event", name: "TicketIssued", anonymous: false, inputs: [
    { name: "poolId", type: "bytes32", indexed: true }, { name: "ticketId", type: "uint256", indexed: true },
    { name: "player", type: "address", indexed: true }, { name: "currency", type: "address", indexed: false },
    { name: "fee", type: "uint256", indexed: false }, { name: "blockNumber", type: "uint256", indexed: false },
  ] },
  { type: "event", name: "Drawn", anonymous: false, inputs: [
    { name: "poolId", type: "bytes32", indexed: true }, { name: "ticketId", type: "uint256", indexed: true },
    { name: "player", type: "address", indexed: true }, { name: "roll", type: "uint256", indexed: false },
    { name: "payoutEth", type: "uint256", indexed: false }, { name: "payoutIce", type: "uint256", indexed: false },
  ] },
  { type: "event", name: "TankFilled", anonymous: false, inputs: [
    { name: "poolId", type: "bytes32", indexed: true }, { name: "player", type: "address", indexed: true },
    { name: "pees", type: "uint256", indexed: false },
  ] },
] as const;
