import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './pumpjewlogofull.png';
import { brand } from './config/brandConfig';

// Tooltip Component with cyberpunk styling
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
          <div className="bg-app-quaternary cyberpunk-border color-primary text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

const CyberpunkServiceButton = ({ 
  icon, 
  label, 
  url,
  description 
}) => {
  const handleClick = (e) => {
    // Prevent event bubbling
    e.stopPropagation();
    
    if (url) {
      // Try using location.href as an alternative to window.open
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error("Error opening URL:", error);
        // Fallback to location.href
        window.location.href = url;
      }
    }
  };

  return (
    <Tooltip content={description || label} position="top">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center w-20 p-2 hover:bg-primary-20 border border-app-primary-30 
                  hover-border-primary-60 rounded-lg cursor-pointer transition-all duration-300"
        onClick={handleClick}
      >
        <motion.div 
          className="w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    bg-app-quaternary border border-app-primary-40 overflow-hidden"
          whileHover={{ 
            borderColor: "var(--color-primary)", 
            boxShadow: "0 0 8px var(--color-primary-40)" 
          }}
        >
          {icon}
        </motion.div>
        <span className="text-app-secondary text-xs font-mono tracking-wider">{label}</span>
      </motion.div>
    </Tooltip>
  );
};

// Dropdown component that uses portal to render outside the normal DOM hierarchy
const DropdownPortal = ({ isOpen, buttonRef, onClose, children }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      
      // Add event listener to close dropdown when clicking outside
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, buttonRef, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      ref={dropdownRef}
      className="fixed z-50" 
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// Main component
const ServiceSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSelector = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Main button to open the selector */}
        <button
          ref={buttonRef}
          onClick={toggleSelector}
          className="flex items-center justify-center p-2 overflow-hidden
                  border border-app-primary-30 hover-border-primary-60 rounded 
                  transition-all duration-300 cyberpunk-btn"
        >
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={logo} 
            alt={brand.altText} 
            className="h-8 w-8 object-contain filter drop-shadow-[0_0_8px_var(--color-primary-70)]" 
          />
        </motion.div>
        </button>

      {/* Service selector modal using portal */}
      <AnimatePresence>
        {isOpen && (
          <DropdownPortal 
            isOpen={isOpen} 
            buttonRef={buttonRef}
            onClose={closeSelector}
          >
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 10, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 bg-app-primary rounded-lg p-4 shadow-lg 
                        w-80 border border-app-primary-40 cyberpunk-border
                        backdrop-blur-sm"
            >
              <div className="relative">
                {/* Cyberpunk scanline effect */}
                <div className="absolute top-0 left-0 w-full h-full cyberpunk-scanline pointer-events-none z-10 opacity-30"></div>
                
                {/* Glow accents in corners */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-app-primary-color opacity-50 rounded-full blur-md"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-app-primary-color opacity-50 rounded-full blur-md"></div>
                
                <motion.div 
                  className="flex flex-wrap justify-center gap-3 relative z-20"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {/* X.com (Twitter) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <CyberpunkServiceButton 
                      icon={<div className="bg-[#000000] rounded-full w-8 h-8 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>} 
                      label="X" 
                      url="https://x.com/jewliquid69"
                      description="Follow us on X"
                    />
                  </motion.div>
                  
                  {/* Perps Trading */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <CyberpunkServiceButton 
                      icon={<div className="bg-[#10B981] rounded-lg w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="1" fill="#FFFFFF"/>
                        </svg>
                      </div>} 
                      label="Perps" 
                      url="https://jewliquid.fun/perp/PERP_ASTER_USDC"
                      description="Perpetual Trading"
                    />
                  </motion.div>
                  
                  {/* Telegram */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <CyberpunkServiceButton 
                      icon={<div className="bg-[#0088CC] rounded-full w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </svg>
                      </div>} 
                      label="Telegram" 
                      url="https://t.me/jewliquid"
                      description="Join our Telegram"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </DropdownPortal>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ServiceSelector;