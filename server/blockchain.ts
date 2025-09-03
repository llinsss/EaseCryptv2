import { Account, Provider, Contract, CallData, uint256 } from 'starknet';

export class StarknetService {
  private provider: Provider;
  private account: Account;
  private contracts: Record<string, Contract>;

  constructor() {
    // Initialize provider
    this.provider = new Provider({
      nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-mainnet.public.blastapi.io',
    });

    // Initialize account (for sending transactions)
    this.account = new Account(
      this.provider,
      process.env.STARKNET_ACCOUNT_ADDRESS || '',
      process.env.STARKNET_PRIVATE_KEY || '',
      '1' // Account version
    );

    // Initialize token contracts
    this.contracts = {
      ETH: new Contract([], process.env.ETH_CONTRACT_ADDRESS || '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', this.provider),
      USDC: new Contract([], process.env.USDC_CONTRACT_ADDRESS || '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', this.provider),
      STRK: new Contract([], process.env.STRK_CONTRACT_ADDRESS || '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', this.provider),
      BTC: new Contract([], process.env.BTC_CONTRACT_ADDRESS || '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac', this.provider),
    };
  }

  async sendToken(
    tokenSymbol: 'ETH' | 'USDC' | 'STRK' | 'BTC',
    toAddress: string,
    amount: string
  ): Promise<string> {
    try {
      const contract = this.contracts[tokenSymbol];
      if (!contract) {
        throw new Error(`Contract for ${tokenSymbol} not found`);
      }

      // Convert amount to proper decimals
      const decimals = this.getTokenDecimals(tokenSymbol);
      const amountInWei = uint256.bnToUint256(BigInt(amount) * BigInt(10 ** decimals));

      // Prepare transfer call
      const transferCall = contract.populate('transfer', [toAddress, amountInWei]);

      // Execute transaction
      const response = await this.account.execute(transferCall);
      
      // Wait for transaction confirmation
      await this.provider.waitForTransaction(response.transaction_hash);
      
      return response.transaction_hash;
    } catch (error) {
      console.error(`Error sending ${tokenSymbol}:`, error);
      throw error;
    }
  }

  async getTokenBalance(
    tokenSymbol: 'ETH' | 'USDC' | 'STRK' | 'BTC',
    address: string
  ): Promise<string> {
    try {
      const contract = this.contracts[tokenSymbol];
      if (!contract) {
        throw new Error(`Contract for ${tokenSymbol} not found`);
      }

      const balance = await contract.call('balanceOf', [address]);
      const decimals = this.getTokenDecimals(tokenSymbol);
      
      return (BigInt(balance.toString()) / BigInt(10 ** decimals)).toString();
    } catch (error) {
      console.error(`Error getting ${tokenSymbol} balance:`, error);
      throw error;
    }
  }

  async getTransactionStatus(txHash: string): Promise<'PENDING' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1' | 'REJECTED'> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return (receipt as any).execution_status || 'PENDING';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'PENDING';
    }
  }

  private getTokenDecimals(tokenSymbol: string): number {
    const decimals = {
      ETH: 18,
      USDC: 6,
      STRK: 18,
      BTC: 8,
    };
    return decimals[tokenSymbol as keyof typeof decimals] || 18;
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      // Basic validation for Starknet address format
      return /^0x[a-fA-F0-9]{63,64}$/.test(address);
    } catch {
      return false;
    }
  }
}

export const starknetService = new StarknetService();