# 🔴 PolkaPortfolio — Polkadot Ecosystem Dashboard

> Hackathon project · Built with React 18, polkadot.js, Subscan & CoinGecko

Track DOT, staking positions, and multichain assets across the entire Polkadot ecosystem in one unified view.

## 🗺 Features

- **Wallet Search** — SS58 or 0x address lookup
- **DOT Balance** — live relay chain data via polkadot.js API
- **Asset Hub Tokens** — USDC, USDT and custom assets
- **Multichain Balances** — Kusama, Moonbeam, Astar, Acala via Subscan
- **Staking Panel** — bonded, unbonding, claimable rewards, APR
- **Live Prices** — CoinGecko free API with fallback estimates
- **Portfolio Value** — total USD value across all chains

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Substrate RPC | `@polkadot/api` |
| Address utils | `@polkadot/util-crypto` |
| EVM (Moonbeam) | `ethers v6` |
| Multichain API | Subscan |
| Prices | CoinGecko Free API |

## ⛓ Supported Networks

| Network | Type | Assets |
|---|---|---|
| Polkadot | Substrate | DOT, staking |
| Asset Hub | Substrate | DOT, USDC, USDT |
| Kusama | Substrate | KSM, staking |
| Moonbeam | EVM parachain | GLMR, ERC-20 |
| Astar | EVM parachain | ASTR, ERC-20 |
| Acala | DeFi parachain | ACA, aUSD |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📦 Build

```bash
npm run build
```

## 🔑 Demo Address

```
13RDY9nrJpyTDBSUdBw12dGwhk19sGwsrVZ2bxkzYHBSagP2
```

## 🌐 Data Sources

- **polkadot.js API** — `api.query.system.account()`, `api.query.assets.account()`, `api.query.staking.ledger()`
- **Subscan Multichain API** — `POST /api/scan/multiChain/account`
- **CoinGecko Free API** — `GET /simple/price`

---

Built for the Polkadot hackathon 2025 🌐
