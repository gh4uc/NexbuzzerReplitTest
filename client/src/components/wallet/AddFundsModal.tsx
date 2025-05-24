import { useState } from "react";
import { X, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { apiRequest } from "@/lib/queryClient";
import { FaPaypal, FaBitcoin, FaApplePay, FaCcVisa } from "react-icons/fa";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

interface Package {
  id: string;
  name: string;
  description: string;
  amount: number;
}

export default function AddFundsModal({ isOpen, onClose, initialAmount }: AddFundsModalProps) {
  const { toast } = useToast();
  const { balance, refreshWallet } = useWallet();
  
  // Available packages
  const packages: Package[] = [
    { id: "voice", name: "Voice Pack", description: "10 minutes of voice calls", amount: 49.7 },
    { id: "video", name: "Video Pack", description: "10 minutes of video calls", amount: 99.7 },
    { id: "combo", name: "Combo Pack", description: "15 min voice + 5 min video", amount: 124.4 },
    { id: "premium", name: "Premium Pack", description: "30 min video calls", amount: 299.1 }
  ];
  
  const [selectedPackage, setSelectedPackage] = useState(initialAmount ? "" : "video");
  const [customAmount, setCustomAmount] = useState(initialAmount?.toFixed(2) || "");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate the amount to be added
  const getAmountToAdd = (): number => {
    if (selectedPackage) {
      const pkg = packages.find(p => p.id === selectedPackage);
      return pkg ? pkg.amount : 0;
    } else if (customAmount) {
      return parseFloat(customAmount);
    }
    return 0;
  };
  
  const handleAddFunds = async () => {
    const amount = getAmountToAdd();
    
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add to your wallet.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await apiRequest("POST", "/api/wallet/add-funds", { amount });
      
      refreshWallet();
      
      toast({
        title: "Funds Added",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-semibold text-xl text-gray-900">
              Add Funds to Your Wallet
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-center mb-6">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center mb-6">
              <p className="text-gray-600">Your current wallet balance</p>
              <div className="text-3xl font-bold text-gray-900 mt-1">${balance.toFixed(2)}</div>
            </div>
            
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Select a Package
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPackage === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary hover:bg-primary/5"
                    }`}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setCustomAmount("");
                    }}
                  >
                    <div className="text-lg font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{pkg.description}</div>
                    <div className="text-accent font-medium">${pkg.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Or Enter Custom Amount
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="custom-amount"
                  type="text"
                  className="pl-8 pr-12"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and a single decimal point
                    if (/^(\d+)?(\.\d{0,2})?$/.test(value)) {
                      setCustomAmount(value);
                      setSelectedPackage("");
                    }
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer ${
                      paymentMethod === "credit" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("credit")}
                  >
                    <FaCcVisa className="text-xl mr-2 text-blue-600" />
                    <span className="font-medium text-gray-900">Credit Card</span>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer ${
                      paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <FaPaypal className="text-xl mr-2 text-blue-800" />
                    <span className="font-medium text-gray-900">PayPal</span>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer ${
                      paymentMethod === "crypto" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("crypto")}
                  >
                    <FaBitcoin className="text-xl mr-2 text-orange-500" />
                    <span className="font-medium text-gray-900">Crypto</span>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer ${
                      paymentMethod === "apple" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("apple")}
                  >
                    <FaApplePay className="text-xl mr-2 text-gray-900" />
                    <span className="font-medium text-gray-900">Apple Pay</span>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
              onClick={handleAddFunds}
              disabled={isProcessing || getAmountToAdd() <= 0}
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                `Add $${getAmountToAdd().toFixed(2)} to Wallet`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
