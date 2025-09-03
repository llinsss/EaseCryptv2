# Smart Contracts

This folder contains the smart contract interfaces and types for the Starknet blockchain integration.

## Token Contracts

The application interacts with the following token contracts on Starknet:

- **BTC (Wrapped Bitcoin)**: `0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac`
- **ETH (Ethereum)**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
- **USDC (USD Coin)**: `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8`
- **STRK (Starknet Token)**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

## Contract ABIs

The contract ABIs are included directly in the backend blockchain integration (`backend/blockchain.ts`).

## Future Enhancements

When expanding this application, you may add:

- Custom token contracts
- Liquidity pool contracts
- DeFi protocol integrations
- Cross-chain bridge contracts

## Usage

The contracts are accessed through the `StarknetService` class in the backend, which handles:

- Token balance queries
- Token transfers
- Transaction status monitoring
- Gas fee estimation