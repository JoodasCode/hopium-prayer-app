import { Button, ButtonProps } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ 
  loading = false, 
  loadingText, 
  children, 
  disabled, 
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        loading && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={{
          opacity: loading ? 0.7 : 1,
          scale: loading ? 0.95 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        <span>{loading && loadingText ? loadingText : children}</span>
      </motion.div>
      
      {loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </Button>
  );
} 