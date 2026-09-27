import { createConfig } from "ponder";
import { JackpotHookAbi } from "./abi/JackpotHook.js";
import { PoolManagerAbi } from "./abi/PoolManager.js";

const chainId = 11155111;
const hookAddress = (process.env.JACKPOT_HOOK_ADDRESS ?? "0xd08e759d3d89eed2de3f03006a6e21ae341d4088") as `0x${string}`;
const startBlock = Number(process.env.JACKPOT_START_BLOCK ?? 11782139);

export default createConfig({
  chains: {
    sepolia: {
      id: chainId,
      rpc: process.env.PONDER_RPC_URL_11155111 ?? "https://ethereum-sepolia.gateway.tatum.io",
    },
  },
  contracts: {
    JackpotHook: { abi: JackpotHookAbi, chain: "sepolia", address: hookAddress, startBlock },
    PoolManager: {
      abi: PoolManagerAbi,
      chain: "sepolia",
      address: (process.env.POOL_MANAGER_ADDRESS ?? "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543") as `0x${string}`,
      startBlock,
      filter: { event: "Swap", args: { id: (process.env.POOL_ID ?? "0x8a4279952ebfdc5be1698760df0bdd8f7643720415c0244cff84acf64a3249df") as `0x${string}` } },
    },
  },
});
