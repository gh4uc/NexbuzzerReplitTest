
import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet } from 'lucide-react';

interface WalletDisplayProps {
  label?: string;
  value?: number;
  isEarnings?: boolean;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({ 
  label = "Balance", 
  value,
  isEarnings = false 
}) => {
  const { balance } = useWallet();
  const displayValue = value !== undefined ? value : balance;

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <Wallet className="h-4 w-4" />
      <span>{label}: ${displayValue.toFixed(2)}</span>
    </div>
  );
};

export default WalletDisplay;
