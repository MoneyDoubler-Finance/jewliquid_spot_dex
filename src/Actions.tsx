import React, { useEffect, useState, useCallback } from 'react';
import {
   Download, 
   Settings2,
   ChevronDown, 
   Share2,
   Waypoints,
   Blocks,
   Trash2,
   ChartSpline,
   Send,
   Workflow,
   Sparkles,
   Activity,
   TrendingUp,
   Users,
   BarChart,
   Coins,
   Bot
 } from 'lucide-react';
import { brand } from './config/brandConfig';
import nukeIcon from './nukeee.png';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { WalletType, loadConfigFromCookies } from "./Utils";
import { useToast } from "./Notifications";
import { countActiveWallets, getScriptName } from './utils/wallets';
import TradingCard from './TradingForm';
import SpaceshipDestroyer from './SpaceshipDestroyer';

import { executeTrade } from './utils/trading';

// Enhanced cyberpunk-styled Switch component (simplified)
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={`
      peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
      border-2 border-app-primary-40 transition-colors duration-300
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-app-primary-color focus-visible:ring-offset-2
      focus-visible:ring-offset-app-primary disabled:cursor-not-allowed
      disabled:opacity-50 data-[state=checked]:bg-app-primary-color data-[state=unchecked]:bg-app-secondary
      relative overflow-hidden ${className}`}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={`
        pointer-events-none block h-5 w-5 rounded-full
        bg-white shadow-lg ring-0 transition-transform
        data-[state=checked]:translate-x-5 data-[state=checked]:bg-app-primary
        data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-app-secondary-color`}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

interface ActionsPageProps {
  tokenAddress: string;
  setTokenAddress: (address: string) => void;
  transactionFee: string;
  handleRefresh: () => void;
  wallets: WalletType[];
  solBalances: Map<string, number>;
  tokenBalances: Map<string, number>;
  currentMarketCap: number | null;
  setBurnModalOpen: (open: boolean) => void;
  setCalculatePNLModalOpen: (open: boolean) => void;
  setDeployModalOpen: (open: boolean) => void;
  setCleanerTokensModalOpen: (open: boolean) => void;
  setCustomBuyModalOpen: (open: boolean) => void;
  onOpenFloating: () => void;
  isFloatingCardOpen: boolean;
  // Automate card state props
  isAutomateCardOpen: boolean;
  setAutomateCardOpen: (open: boolean) => void;
  automateCardPosition: { x: number; y: number };
  setAutomateCardPosition: (position: { x: number; y: number }) => void;
  isAutomateCardDragging: boolean;
  setAutomateCardDragging: (dragging: boolean) => void;
  iframeData?: {
    tradingStats: any;
    solPrice: number | null;
    currentWallets: any[];
    recentTrades: {
      type: 'buy' | 'sell';
      address: string;
      tokensAmount: number;
      avgPrice: number;
      solAmount: number;
      timestamp: number;
      signature: string;
    }[];
    tokenPrice: {
      tokenPrice: number;
      tokenMint: string;
      timestamp: number;
      tradeType: 'buy' | 'sell';
      volume: number;
    } | null;
  } | null;
}

// Simplified Tooltip component without animations
export const Tooltip = ({ 
  children, 
  content,
  position = 'top'
}: { 
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-app-quaternary border border-app-primary-40 color-primary text-xs px-2 py-1 rounded 
                         shadow-lg shadow-app-primary-20 whitespace-nowrap font-mono tracking-wide">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
// Cyberpunk-themed DataBox with minimal clean column layout
const DataBox: React.FC<{
  iframeData?: {
    tradingStats: any;
    solPrice: number | null;
    currentWallets: any[];
    recentTrades: {
      type: 'buy' | 'sell';
      address: string;
      tokensAmount: number;
      avgPrice: number;
      solAmount: number;
      timestamp: number;
      signature: string;
    }[];
    tokenPrice: {
      tokenPrice: number;
      tokenMint: string;
      timestamp: number;
      tradeType: 'buy' | 'sell';
      volume: number;
    } | null;
  } | null;
  tokenAddress: string;
  tokenBalances: Map<string, number>;
}> = ({ iframeData, tokenAddress, tokenBalances }) => {
  const [showUSD, setShowUSD] = useState(false);
  
  if (!tokenAddress || !iframeData) return null;

  const { tradingStats, solPrice, currentWallets, recentTrades, tokenPrice } = iframeData;

  // Calculate holdings value
  const totalTokens = Array.from(tokenBalances.values()).reduce((sum, balance) => sum + balance, 0);
  const currentTokenPrice = tokenPrice?.tokenPrice || 0;
  const holdingsValue = totalTokens * currentTokenPrice;
  
  // Currency conversion helper
  const formatValue = (solValue: number) => {
    if (showUSD && solPrice) {
      return (solValue * solPrice).toFixed(2);
    }
    return solValue.toFixed(2);
  };
  
  const handleCurrencyToggle = () => {
    setShowUSD(!showUSD);
  };

  return (
    <div className="mb-4">
      <div 
        onClick={handleCurrencyToggle}
        className="bg-gradient-to-br from-app-secondary-80 to-app-primary-dark-50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-app-primary-20 relative overflow-hidden cursor-pointer hover:border-app-primary-40 transition-all duration-300"
      >
        
        {/* Cyberpunk accent lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-app-primary-40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-app-primary-40 to-transparent"></div>
        
        {/* Main stats grid - clean 4-column layout */}
        <div className="grid grid-cols-4 gap-8 relative z-10">
          
          {/* Bought */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-xs font-mono tracking-wider text-app-secondary-80 uppercase mb-2 font-medium">
              Bought
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold color-primary font-mono tracking-tight">
                {tradingStats ? formatValue(tradingStats.bought) : formatValue(0)}
              </div>
              {showUSD ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100 transition-opacity">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                </svg>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="w-2 h-0.5 bg-app-primary-color rounded opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-app-primary-color rounded opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-app-primary-color rounded opacity-40 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
          </div>

          {/* Sold */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-xs font-mono tracking-wider text-app-secondary-80 uppercase mb-2 font-medium">
              Sold
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-warning font-mono tracking-tight">
                {tradingStats ? formatValue(tradingStats.sold) : formatValue(0)}
              </div>
              {showUSD ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100 transition-opacity text-warning">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                </svg>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="w-2 h-0.5 bg-warning rounded opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-warning rounded opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-warning rounded opacity-40 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
          </div>

          {/* Holding */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-xs font-mono tracking-wider text-app-secondary-80 uppercase mb-2 font-medium">
              Holding
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-app-secondary font-mono tracking-tight">
                {formatValue(holdingsValue)}
              </div>
              {showUSD ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100 transition-opacity text-app-secondary">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                </svg>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="w-2 h-0.5 bg-app-secondary-color rounded opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-app-secondary-color rounded opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-2 h-0.5 bg-app-secondary-color rounded opacity-40 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
          </div>

          {/* PnL */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-xs font-mono tracking-wider text-app-secondary-80 uppercase mb-2 font-medium">
              PnL
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold font-mono tracking-tight ${
                tradingStats && (tradingStats.net + holdingsValue) >= 0 ? 'color-primary' : 'text-warning'
              }`}>
                {tradingStats ? (
                  <div>
                    {(() => {
                      const value = tradingStats.net + holdingsValue;
                      const formattedValue = formatValue(Math.abs(value));
                      const sign = value >= 0 ? '+' : '-';
                      return `${sign}${formattedValue}`;
                    })()}
                  </div>
                ) : (
                  <div>+{formatValue(holdingsValue)}</div>
                )}
              </div>
              {showUSD ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`opacity-80 group-hover:opacity-100 transition-opacity ${
                   tradingStats && (tradingStats.net + holdingsValue) >= 0 ? 'text-app-primary' : 'text-warning'
                 }`}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                </svg>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className={`w-2 h-0.5 rounded opacity-80 group-hover:opacity-100 transition-opacity ${
                    tradingStats && (tradingStats.net + holdingsValue) >= 0 ? 'bg-app-primary-color' : 'bg-warning'
                  }`}></div>
                  <div className={`w-2 h-0.5 rounded opacity-60 group-hover:opacity-100 transition-opacity ${
                    tradingStats && (tradingStats.net + holdingsValue) >= 0 ? 'bg-app-primary-color' : 'bg-warning'
                  }`}></div>
                  <div className={`w-2 h-0.5 rounded opacity-40 group-hover:opacity-100 transition-opacity ${
                    tradingStats && (tradingStats.net + holdingsValue) >= 0 ? 'bg-app-primary-color' : 'bg-warning'
                  }`}></div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Minimal footer info */}
        {currentWallets && currentWallets.length > 0 && (
          <div className="mt-8 pt-4 border-t border-app-primary-20">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-app-primary-color animate-pulse"></div>
                <span className="text-app-secondary font-mono text-xs tracking-wider">
                  {currentWallets.length} ACTIVE
                </span>
              </div>
              {tradingStats && (
                <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-app-primary-color"></div>
                  <span className="text-app-secondary font-mono text-xs tracking-wider">
                    {tradingStats.trades} TRADES
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-app-primary-05 to-transparent pointer-events-none"></div>
        
      </div>
    </div>
  );
};
export const ActionsPage: React.FC<ActionsPageProps> = ({ 
  tokenAddress, 
  setTokenAddress,
  transactionFee, 
  handleRefresh, 
  wallets, 
  solBalances, 
  tokenBalances, 
  currentMarketCap,
  setBurnModalOpen,
  setCalculatePNLModalOpen,
  setDeployModalOpen,
  setCleanerTokensModalOpen,
  setCustomBuyModalOpen,
  onOpenFloating,
  isFloatingCardOpen,
  // Automate card state props
  isAutomateCardOpen,
  setAutomateCardOpen,
  automateCardPosition,
  setAutomateCardPosition,
  isAutomateCardDragging,
  setAutomateCardDragging,
  iframeData
}) => {
  // State management
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [selectedDex, setSelectedDex] = useState('auto'); // Default to auto
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const { showToast } = useToast();
  
  // Auto-buy settings
  const [autoBuyEnabled, setAutoBuyEnabled] = useState(true);
  const [autoBuyAmount, setAutoBuyAmount] = useState('0.01'); // Default SOL amount for auto-buy
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState(false); // Auto redirect to token after buy
  
  // Spaceship Destroyer Game State
  const [isSpaceshipGameActive, setIsSpaceshipGameActive] = useState(false);


  const handleTradeSubmit = async (wallets: WalletType[], isBuyMode: boolean, dex?: string, buyAmount?: string, sellAmount?: string, tokenAddressParam?: string) => {
    setIsLoading(true);
    
    // Use tokenAddressParam if provided, otherwise use the component's tokenAddress
    const tokenAddressToUse = tokenAddressParam || tokenAddress;
    
    if (!tokenAddressToUse) {
      showToast("Please select a token first", "error");
      setIsLoading(false);
      return;
    }
    
    try {
      // Use the provided dex parameter if available, otherwise use selectedDex
      const dexToUse = dex || selectedDex;
      
      // Create trading config
       const config = {
         tokenAddress: tokenAddressToUse,
         ...(isBuyMode 
           ? { solAmount: parseFloat(buyAmount || '0') }
           : { sellPercent: parseFloat(sellAmount || '0') }
         )
       };
      
      console.log(`Executing ${isBuyMode ? 'Buy' : 'Sell'} on ${dexToUse} for ${tokenAddressToUse}`);
      
      // Execute trade using centralized logic
      const result = await executeTrade(dexToUse, wallets, config, isBuyMode, solBalances);
      
      if (result.success) {
        showToast(`${dexToUse} ${isBuyMode ? 'Buy' : 'Sell'} transactions submitted successfully`, "success");
      } else {
        showToast(`${dexToUse} ${isBuyMode ? 'Buy' : 'Sell'} failed: ${result.error}`, "error");
      }
    } catch (error) {
      console.error(`Trading error:`, error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle iframe messages for TOKEN_SELECTED and TOKEN_BUY
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle TOKEN_SELECTED message (only for token selection, no auto-buy)
      if (event.data && event.data.type === 'TOKEN_SELECTED') {
        console.log('Received TOKEN_SELECTED message:', event.data);
      }
      
      // Handle TOKEN_BUY message for quick buy functionality
      if (event.data && event.data.type === 'TOKEN_BUY') {
        console.log('Received TOKEN_BUY message:', event.data);
        
        // Try different possible property names for the token address
        const tokenMint = event.data.tokenMint || event.data.tokenAddress || event.data.token || event.data.mint;
        console.log('Quick buy requested for token:', tokenMint);
        
        if (tokenMint) {
          // Get active wallets
          const activeWallets = wallets.filter(wallet => wallet.isActive);
          
          if (activeWallets.length > 0) {
            // Execute buy with the specified amount and token address from the message
            handleTradeSubmit(activeWallets, true, 'auto', autoBuyAmount, undefined, tokenMint);
            showToast(`Quick buying ${autoBuyAmount} SOL of token ${tokenMint.substring(0, 8)}...`, "success");
            
            // Auto redirect to token if enabled
            if (autoRedirectEnabled && setTokenAddress) {
              setTimeout(() => {
                setTokenAddress(tokenMint);
              }, 1000); // Wait 1 seconds after buy to redirect
            }
          } else {
            showToast("No active wallets for quick buy", "error");
          }
        } else {
          console.error('TOKEN_BUY message missing token identifier. Available properties:', Object.keys(event.data));
          showToast("Invalid token for quick buy - missing token identifier", "error");
        }
      }
    };

    // Add event listener for messages
    window.addEventListener('message', handleMessage);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [autoBuyEnabled, tokenAddress, autoBuyAmount, autoRedirectEnabled, wallets, handleTradeSubmit, showToast, setTokenAddress]);

  // Send QUICKBUY_ACTIVATE to iframe when component loads without token set
  useEffect(() => {
    const sendQuickBuyActivate = () => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow && !tokenAddress) {
        console.log('Sending QUICKBUY_ACTIVATE to iframe on load (no token set)');
        iframe.contentWindow.postMessage({
          type: 'QUICKBUY_ACTIVATE'
        }, '*');
      }
    };

    // Send activation message after a short delay to ensure iframe is loaded
    const timer = setTimeout(sendQuickBuyActivate, 1000);
    
    return () => clearTimeout(timer);
  }, [tokenAddress]); // Re-run when tokenAddress changes

  return (
    <div className="flex-1 overflow-y-auto bg-app-primary p-4 md:p-6 relative">
      {/* Background effects - keeping original */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-app-primary opacity-90">
          <div className="absolute inset-0 bg-gradient-to-b from-app-primary-05 to-transparent"></div>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(var(--color-primary-05) 1px, transparent 1px),
                linear-gradient(90deg, var(--color-primary-05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: 'center center',
            }}
          ></div>
        </div>
        
        {/* Glowing corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
          <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-app-primary-color to-transparent"></div>
          <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-app-primary-color to-transparent"></div>
          <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20">
          <div className="absolute bottom-0 left-0 w-px h-16 bg-gradient-to-t from-app-primary-color to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-16 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute bottom-0 right-0 w-px h-16 bg-gradient-to-t from-app-primary-color to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-16 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Trading Card - only show when token is selected, otherwise show auto-buy settings */}
        {tokenAddress ? (
          <TradingCard
            tokenAddress={tokenAddress}
            wallets={wallets}
            selectedDex={selectedDex}
            setSelectedDex={setSelectedDex}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            sellAmount={sellAmount}
            setSellAmount={setSellAmount}
            handleTradeSubmit={handleTradeSubmit}
            isLoading={isLoading}
            getScriptName={getScriptName}
            countActiveWallets={countActiveWallets}
            currentMarketCap={currentMarketCap}
            tokenBalances={tokenBalances}
            onOpenFloating={onOpenFloating}
            isFloatingCardOpen={isFloatingCardOpen}
            solPrice={iframeData?.solPrice}
          />
        ) : (
          <div className="relative overflow-hidden rounded-xl shadow-xl bg-gradient-to-br from-app-secondary-80 to-app-primary-dark-50 backdrop-blur-sm p-6 border border-app-primary-20">
            {/* Cyberpunk corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
              <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-app-primary-color to-transparent"></div>
              <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
              <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-app-primary-color to-transparent"></div>
              <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-px h-8 bg-gradient-to-t from-app-primary-color to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-8 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-px h-8 bg-gradient-to-t from-app-primary-color to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-8 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
            </div>
            <div className="space-y-6">
              {/* Auto redirect toggle */}
              <div className="flex items-center justify-between bg-app-primary-60-alpha p-4 rounded-lg border border-app-primary-40 relative overflow-hidden">
                {/* Cyberpunk corner accents - smaller version */}
                <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-app-primary-color to-transparent"></div>
                  <div className="absolute top-0 left-0 w-4 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-app-primary-color to-transparent"></div>
                  <div className="absolute top-0 right-0 w-4 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
                </div>
                
                <div>
                  <div className="text-app-secondary font-mono text-xs tracking-wide flex items-center">
                    <span className="mr-2 text-app-primary-color">⟁</span>
                    <span>AUTO REDIRECT TOKEN</span>
                  </div>
                  <div className="text-xs text-app-secondary-60 mt-2 ml-5">Redirect to token after buy</div>
                </div>
                <Switch 
                  checked={autoRedirectEnabled} 
                  onCheckedChange={setAutoRedirectEnabled}
                />
              </div>
              
              {/* SOL amount input */}
              <div className="bg-app-primary-60-alpha p-4 rounded-lg border border-app-primary-40 relative overflow-hidden">
                {/* Cyberpunk corner accents - smaller version */}
                <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-app-primary-color to-transparent"></div>
                  <div className="absolute top-0 left-0 w-4 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-app-primary-color to-transparent"></div>
                  <div className="absolute top-0 right-0 w-4 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
                </div>
                
                <div className="text-app-secondary font-mono text-xs tracking-wide mb-3 flex items-center">
                  <span className="mr-2 text-app-primary-color">⟁</span>
                  <span>SOL AMOUNT</span>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    value={autoBuyAmount}
                    onChange={(e) => setAutoBuyAmount(e.target.value)}
                    min="0.001"
                    step="0.001"
                    className="w-full px-2 py-2 bg-app-primary-80-alpha border border-app-primary-40 rounded-lg 
                           text-app-primary placeholder-app-secondary-60 font-mono text-sm 
                           focus:outline-none focus-border-primary focus:ring-1 focus:ring-app-primary-40 
                           transition-all duration-300 shadow-inner-black-80
                           disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter SOL amount"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-primary-color text-xs font-mono font-bold">
                    SOL
                  </div>
                </div>
              </div>
              
              {/* Active wallets info */}
              <div className="bg-app-primary-60-alpha p-4 rounded-lg border border-app-primary-40 relative overflow-hidden">
                {/* Cyberpunk corner accents - smaller version */}
                <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-app-primary-color to-transparent"></div>
                  <div className="absolute top-0 left-0 w-4 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-60">
                  <div className="absolute bottom-0 right-0 w-px h-4 bg-gradient-to-t from-app-primary-color to-transparent"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
                </div>
                
                <div className="text-app-secondary font-mono text-xs tracking-wide mb-3 flex items-center">
                  <span className="mr-2 text-app-primary-color">⟁</span>
                  <span>ACTIVE WALLETS</span>
                </div>
                
                <div className="text-xs text-app-secondary-60 flex items-center justify-between bg-app-primary-dark p-2 rounded border border-app-primary-40">
                  <span>Wallets selected to buy:</span>
                  <span className="text-app-primary-color font-mono font-bold">{countActiveWallets(wallets)}</span>
                </div>
                
                {countActiveWallets(wallets) === 0 && (
                  <div className="mt-3 text-warning text-xs font-mono flex items-center bg-app-primary-dark-50 p-2 rounded border border-warning-40">
                    <span className="inline-block w-2 h-2 bg-warning rounded-full mr-2 animate-pulse"></span>
                    No active wallets. Enable wallets to use auto-buy.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Token Operations - removed per request */}
        <div className="space-y-4">
          {/* Buttons removed: AUTOMATE, Deploy, Burn, Stagger */}
          {/* Live Data Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-app-primary-20 to-app-primary-05 rounded-lg">
                  <Activity size={16} className="color-primary" />
                </div>
                <span className="font-mono text-sm tracking-wider text-app-secondary uppercase">Live Data</span>
              </div>
              
              {/* Share PNL Button moved next to Live Data */}
              <button
                onClick={() => {
                  if (!tokenAddress) {
                    showToast("Please select a token first", "error");
                    return;
                  }
                  setCalculatePNLModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                          bg-gradient-to-r from-app-primary-color to-app-primary-dark hover-from-app-primary-dark hover-to-app-primary-color
                          shadow-md shadow-app-primary-40 hover-shadow-app-primary-60
                          transition-all duration-300 relative overflow-hidden"
              >
                <ChartSpline size={16} className="text-black relative z-10" />
                <span className="text-sm font-mono tracking-wider text-black font-medium relative z-10">Share PNL</span>
              </button>
            </div>
            <DataBox iframeData={iframeData} tokenAddress={tokenAddress} tokenBalances={tokenBalances} />
          </div>
        </div>
      </div>

      <br></br>
      
      {/* JewLiquid Perp Trading Link */}
      <div className="mb-4 mx-auto max-w-4xl">
        <a 
          href="https://jewliquid.fun/perp/PERP_ASTER_USDC" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-gradient-to-br from-app-secondary-50 to-app-primary-dark-50 backdrop-blur-sm 
                       rounded-xl p-6 relative overflow-hidden border border-app-primary-10 
                       hover-border-primary-60 transition-all duration-300 transform hover:scale-[1.02]
                       cursor-pointer group">
            
            {/* Cyberpunk corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
              <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-app-primary-color to-transparent"></div>
              <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-app-primary-color to-transparent"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-px h-8 bg-gradient-to-t from-app-primary-color to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-8 h-px bg-gradient-to-l from-app-primary-color to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-app-primary-20 to-app-primary-05 rounded-lg
                               group-hover:from-app-primary-30 group-hover:to-app-primary-10 transition-all duration-300">
                  <TrendingUp size={24} className="color-primary" />
                </div>
                <div>
                  <div className="text-sm font-mono tracking-wider text-app-secondary font-semibold mb-1
                                 group-hover:color-primary transition-colors duration-300">
                    TRADE PERPETUALS
                  </div>
                  <div className="text-xs text-app-secondary-60 font-mono">
                    Visit JewLiquid Perp Exchange
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono color-primary opacity-0 group-hover:opacity-100 
                               transition-opacity duration-300">
                  CLICK TO TRADE
                </span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="color-primary transform group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path 
                    d="M5 12h14m-7-7l7 7-7 7" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-app-primary-05 to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </a>
      </div>

      {/* SAMSPON OPTION Button */}
      <div className="mb-4 mx-auto max-w-4xl">
        <button 
          onClick={() => {
            showToast("💥 SAMPSON OPTION ACTIVATED! 💥 Spaceship Destroyer Launched!", "success");
            setIsSpaceshipGameActive(true);
          }}
          className="block w-full"
        >
          <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 backdrop-blur-sm 
                       rounded-xl p-6 relative overflow-hidden border-2 border-red-500/30 
                       hover:border-red-400 transition-all duration-300 transform hover:scale-[1.02]
                       cursor-pointer group animate-pulse hover:animate-none shadow-lg shadow-red-500/20
                       hover:shadow-red-500/50">
            
            {/* Animated corner accents with danger theme */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
              <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-red-500 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 w-12 h-1 bg-gradient-to-r from-red-500 to-transparent animate-pulse"></div>
              <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-1 h-12 bg-gradient-to-t from-red-500 to-transparent animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-12 h-1 bg-gradient-to-l from-red-500 to-transparent animate-pulse"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            </div>
            
            {/* Diagonal danger stripes background */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.3) 10px, rgba(239, 68, 68, 0.3) 20px)'
                 }}>
            </div>
            
            {/* Content */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-0 rounded-lg border-0 overflow-hidden flex-shrink-0 leading-none">
                  <img 
                    src={nukeIcon} 
                    alt="Nuke" 
                    className="block h-14 w-auto brightness-110 group-hover:brightness-125 transition-all duration-300
                               group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-lg leading-none select-none">⚠️</div>
                  <div className="text-base font-mono tracking-widest text-red-400 font-bold my-1 text-center
                                 group-hover:text-red-300 transition-colors duration-300
                                 group-hover:animate-pulse uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    <div>SAMPSON</div>
                    <div>OPTION</div>
                  </div>
                  <div className="text-lg leading-none select-none">⚠️</div>
                  <div className="text-xs text-red-400/70 font-mono group-hover:text-red-300/90 transition-colors text-center mt-2">
                    Nuclear-grade trading power
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-red-400 opacity-0 group-hover:opacity-100 
                               transition-opacity duration-300 font-bold animate-pulse">
                  DANGER ZONE
                </span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-red-400 transform group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300"
                >
                  <path 
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="currentColor"
                    className="group-hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]"
                  />
                </svg>
              </div>
            </div>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-500/10 to-red-600/0 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                           animate-pulse"></div>
            
            {/* Scanning line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300
                           animate-[scan_2s_ease-in-out_infinite]"
                   style={{
                     animation: 'scan 2s ease-in-out infinite',
                     top: '50%'
                   }}>
              </div>
            </div>
          </div>
        </button>
      </div>
      
      {/* Spaceship Destroyer Game */}
      <SpaceshipDestroyer 
        isActive={isSpaceshipGameActive}
        onClose={() => setIsSpaceshipGameActive(false)}
      />
      
    </div>
  );
};