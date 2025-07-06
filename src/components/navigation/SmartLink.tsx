'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  showFeedback?: boolean;
  disabled?: boolean;
}

export function SmartLink({ 
  href, 
  children, 
  className, 
  prefetch = true, 
  showFeedback = true,
  disabled = false 
}: SmartLinkProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (prefetch) {
      router.prefetch(href);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  if (disabled) {
    return (
      <div className={cn("opacity-50 cursor-not-allowed", className)}>
        {children}
      </div>
    );
  }

  return (
    <Link href={href} className="block">
      <motion.div
        className={cn(
          "transition-all duration-200 ease-out",
          showFeedback && "active:scale-95",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        whileHover={showFeedback ? { scale: 1.02 } : undefined}
        whileTap={showFeedback ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </Link>
  );
}

// Enhanced navigation for bottom nav
export function NavItem({ 
  href, 
  icon, 
  label, 
  isActive = false 
}: { 
  href: string; 
  icon: ReactNode; 
  label: string; 
  isActive?: boolean;
}) {
  const router = useRouter();

  return (
    <SmartLink 
      href={href} 
      className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors"
      prefetch={true}
      showFeedback={true}
    >
      <motion.div
        className={cn(
          "p-2 rounded-lg transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
      </motion.div>
      <span className={cn(
        "text-xs font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </SmartLink>
  );
} 