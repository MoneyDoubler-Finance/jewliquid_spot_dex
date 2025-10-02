import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface SpaceshipDestroyerProps {
  isActive: boolean;
  onClose: () => void;
}

const SpaceshipDestroyer: React.FC<SpaceshipDestroyerProps> = ({ isActive, onClose }) => {
  const [shipPosition, setShipPosition] = useState({ x: 100, y: 100 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [score, setScore] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [shipAngle, setShipAngle] = useState(0);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const bulletIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  // Handle keyboard input for ship movement
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive) return;
    
    keysPressed.current.add(e.code);
    
    if (e.code === 'Space') {
      e.preventDefault();
      setIsShooting(true);
    }
    
    if (e.code === 'Escape') {
      onClose();
    }
  }, [isActive, onClose]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.code);
    
    if (e.code === 'Space') {
      e.preventDefault();
      setIsShooting(false);
    }
  }, []);

  // Update ship position based on pressed keys
  const updateShipPosition = useCallback(() => {
    if (!gameRef.current || !isActive) return;
    
    const rect = gameRef.current.getBoundingClientRect();
    const speed = 5;
    let newX = shipPosition.x;
    let newY = shipPosition.y;
    let newAngle = shipAngle;
    
    // Movement controls
    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
      newY = Math.max(32, newY - speed);
    }
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
      newY = Math.min(rect.height - 32, newY + speed);
    }
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
      newX = Math.max(24, newX - speed);
      newAngle = -90;
    }
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
      newX = Math.min(rect.width - 24, newX + speed);
      newAngle = 90;
    }
    
    // Diagonal movement
    if ((keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) && 
        (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft'))) {
      newAngle = -135;
    }
    if ((keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) && 
        (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight'))) {
      newAngle = 135;
    }
    if ((keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) && 
        (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft'))) {
      newAngle = -45;
    }
    if ((keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) && 
        (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight'))) {
      newAngle = 45;
    }
    
    setShipPosition({ x: newX, y: newY });
    setShipAngle(newAngle);
  }, [isActive, shipPosition.x, shipPosition.y, shipAngle]);

  // Shoot bullet
  const shootBullet = useCallback(() => {
    if (!isShooting || !gameRef.current) return;
    
    // Convert degrees to radians for bullet direction
    const angleInRadians = (shipAngle * Math.PI) / 180;
    
    const newBullet: Bullet = {
      id: bulletIdRef.current++,
      x: shipPosition.x,
      y: shipPosition.y,
      angle: angleInRadians
    };
    
    setBullets(prev => [...prev, newBullet]);
  }, [isShooting, shipPosition, shipAngle]);

  // Update bullets position
  const updateBullets = useCallback(() => {
    setBullets(prev => 
      prev.map(bullet => ({
        ...bullet,
        x: bullet.x + Math.cos(bullet.angle) * 8,
        y: bullet.y + Math.sin(bullet.angle) * 8
      })).filter(bullet => {
        if (!gameRef.current) return false;
        const rect = gameRef.current.getBoundingClientRect();
        return bullet.x >= 0 && bullet.x <= rect.width && bullet.y >= 0 && bullet.y <= rect.height;
      })
    );
  }, []);

  // Check for collisions with page elements
  const checkCollisions = useCallback(() => {
    bullets.forEach(bullet => {
      const elements = document.elementsFromPoint(
        bullet.x + (gameRef.current?.getBoundingClientRect().left || 0),
        bullet.y + (gameRef.current?.getBoundingClientRect().top || 0)
      );
      
      elements.forEach(element => {
        // Skip our game elements
        if (gameRef.current?.contains(element)) return;
        
        // Create explosion effect
        const rect = element.getBoundingClientRect();
        const gameRect = gameRef.current?.getBoundingClientRect();
        if (gameRect) {
          const explosionX = rect.left + rect.width / 2 - gameRect.left;
          const explosionY = rect.top + rect.height / 2 - gameRect.top;
          
          setExplosions(prev => [...prev, {
            id: explosionIdRef.current++,
            x: explosionX,
            y: explosionY,
            timestamp: Date.now()
          }]);
          
          // Add visual destruction effect to the element
          const htmlElement = element as HTMLElement;
          htmlElement.style.filter = 'blur(2px) brightness(1.5)';
          htmlElement.style.transform = 'scale(0.95)';
          htmlElement.style.transition = 'all 0.3s ease';
          
          // Remove the effect after a delay
          setTimeout(() => {
            htmlElement.style.filter = '';
            htmlElement.style.transform = '';
          }, 500);
          
          setScore(prev => prev + 10);
        }
      });
    });
  }, [bullets]);

  // Remove old explosions
  const updateExplosions = useCallback(() => {
    setExplosions(prev => prev.filter(explosion => Date.now() - explosion.timestamp < 1000));
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isActive) return;
    
    updateShipPosition();
    updateBullets();
    checkCollisions();
    updateExplosions();
    
    if (isShooting) {
      shootBullet();
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isActive, isShooting, updateShipPosition, updateBullets, checkCollisions, updateExplosions, shootBullet]);

  // Set up event listeners
  useEffect(() => {
    if (!isActive) return;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, handleKeyDown, handleKeyUp]);

  // Start game loop
  useEffect(() => {
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, gameLoop]);

  if (!isActive) return null;

  return (
    <div 
      ref={gameRef}
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
      style={{ cursor: 'none' }}
    >
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 text-white p-4 rounded-lg font-mono">
        <div className="text-lg font-bold">MENORAH DESTROYER</div>
        <div className="text-sm">Score: {score}</div>
        <div className="text-xs text-gray-400 mt-2">
          WASD or Arrow Keys to move<br/>
          SPACEBAR to shoot<br/>
          ESC to exit
        </div>
      </div>
      
      {/* Menorah Spaceship */}
      <div
        className="absolute w-12 h-16 z-20 pointer-events-none"
        style={{
          left: shipPosition.x - 24,
          top: shipPosition.y - 32,
          transform: `rotate(${shipAngle}deg)`,
          transition: 'transform 0.1s ease'
        }}
      >
        <svg viewBox="0 0 48 64" className="w-full h-full">
          {/* Menorah Base */}
          <rect x="20" y="50" width="8" height="14" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
          
          {/* Central Stem */}
          <rect x="22" y="20" width="4" height="30" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Left Branch */}
          <rect x="8" y="25" width="4" height="25" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="6" y="24" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Right Branch */}
          <rect x="36" y="25" width="4" height="25" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="34" y="24" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Left-Left Branch */}
          <rect x="2" y="30" width="4" height="20" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="0" y="29" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Right-Right Branch */}
          <rect x="42" y="30" width="4" height="20" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="40" y="29" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Left-Left-Left Branch */}
          <rect x="-4" y="35" width="4" height="15" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="-6" y="34" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Right-Right-Right Branch */}
          <rect x="48" y="35" width="4" height="15" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <rect x="46" y="34" width="8" height="2" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          {/* Flames */}
          <circle cx="4" cy="20" r="2" fill="#FF4500" opacity="0.8"/>
          <circle cx="14" cy="18" r="2" fill="#FF4500" opacity="0.8"/>
          <circle cx="24" cy="16" r="2" fill="#FF4500" opacity="0.8"/>
          <circle cx="34" cy="18" r="2" fill="#FF4500" opacity="0.8"/>
          <circle cx="44" cy="20" r="2" fill="#FF4500" opacity="0.8"/>
          
          {/* Glow effect */}
          <circle cx="4" cy="20" r="4" fill="#FF4500" opacity="0.3"/>
          <circle cx="14" cy="18" r="4" fill="#FF4500" opacity="0.3"/>
          <circle cx="24" cy="16" r="4" fill="#FF4500" opacity="0.3"/>
          <circle cx="34" cy="18" r="4" fill="#FF4500" opacity="0.3"/>
          <circle cx="44" cy="20" r="4" fill="#FF4500" opacity="0.3"/>
        </svg>
      </div>
      
      {/* Bullets */}
      {bullets.map(bullet => (
        <div
          key={bullet.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none"
          style={{
            left: bullet.x - 4,
            top: bullet.y - 4,
            boxShadow: '0 0 6px #ffff00'
          }}
        />
      ))}
      
      {/* Explosions */}
      {explosions.map(explosion => {
        const age = Date.now() - explosion.timestamp;
        const size = Math.min(age / 50, 40);
        const opacity = Math.max(0, 1 - age / 1000);
        
        return (
          <div
            key={explosion.id}
            className="absolute pointer-events-none"
            style={{
              left: explosion.x - size / 2,
              top: explosion.y - size / 2,
              width: size,
              height: size,
              opacity
            }}
          >
            <div
              className="w-full h-full rounded-full bg-gradient-radial from-yellow-400 via-orange-500 to-red-600"
              style={{
                boxShadow: `0 0 ${size}px #ff6600`
              }}
            />
          </div>
        );
      })}
      
    </div>
  );
};

export default SpaceshipDestroyer;
