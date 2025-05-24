
declare module '@/contexts/WalletContext' {
  interface WalletContextType {
    balance: number;
    isLoading: boolean;
    refreshWallet: () => void;
    addFunds: (amount: number) => Promise<boolean>;
  }

  export function useWallet(): WalletContextType;
  export const WalletProvider: React.FC<{ children: React.ReactNode }>;
}
