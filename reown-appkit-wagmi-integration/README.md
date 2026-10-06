# AppKit + Wagmi integration

This Vite app connects wallets with Reown AppKit and uses Wagmi to read from and
write to the MGO ERC-20 contract.

## Setup

Create a `.env` file from `.env.example` and set the deployed contract address:

```bash
cp .env.example .env
```

Set `VITE_MGO_CONTRACT_ADDRESS` to the MGO contract deployed on the configured
network (Sepolia by default). Start the app with:

```bash
npm run dev
```

After connecting a wallet with AppKit, the app reads token metadata, total
supply, and the connected account balance. The faucet and transfer controls
submit Wagmi write transactions and display their confirmation status.
