'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'playful'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface PlayfulButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gradient-to-r from-purple-600 to-pink-600',
    'hover:from-purple-700 hover:to-pink-700',
    'text-white shadow-lg hover:shadow-xl',
    'border-2 border-transparent'
  ),
  secondary: cn(
    'bg-gradient-to-r from-blue-500 to-teal-500',
    'hover:from-blue-600 hover:to-teal-600',
    'text-white shadow-md hover:shadow-lg',
    'border-2 border-transparent'
  ),
  success: cn(
    'bg-gradient-to-r from-green-500 to-emerald-600',
    'hover:from-green-600 hover:to-emerald-700',
    'text-white shadow-md hover:shadow-lg',
    'border-2 border-transparent'
  ),
  warning: cn(
    'bg-gradient-to-r from-yellow-400 to-orange-400',
    'hover:from-yellow-500 hover:to-orange-500',
    'text-gray-900 shadow-md hover:shadow-lg',
    'border-2 border-transparent'
  ),
  playful: cn(
    'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600',
    'hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700',
    'text-white shadow-lg hover:shadow-2xl',
    'border-2 border-transparent',
    'bg-[length:200%_100%] hover:bg-[length:100%_100%] transition-all duration-500'
  ),
  outline: cn(
    'bg-transparent border-2 border-purple-600',
    'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    'hover:border-purple-700'
  ),
  ghost: cn(
    'bg-transparent text-purple-600',
    'hover:bg-purple-50 dark:hover:bg-purple-900/20'
  ),
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-2xl',
};

export const PlayfulButton = forwardRef<HTMLButtonElement, PlayfulButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2',
          'font-semibold transition-all duration-200',
          'transform active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          VARIANT_STYLES[variant],
          // Size styles
          SIZE_STYLES[size],
          // Width
          fullWidth && 'w-full',
          // Custom className
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}

        {/* Left Icon */}
        {!loading && icon && iconPosition === 'left' && (
          <span className="inline-flex">{icon}</span>
        )}

        {/* Children */}
        <span className="inline-flex items-center gap-2">
          {children}
        </span>

        {/* Right Icon */}
        {!loading && icon && iconPosition === 'right' && (
          <span className="inline-flex">{icon}</span>
        )}

        {/* Ripple Effect (for non-gradient buttons) */}
        {(variant === 'outline' || variant === 'ghost') && (
          <motion.span
            className="absolute inset-0 rounded-[inherit] bg-purple-400/20"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.button>
    );
  }
);

PlayfulButton.displayName = 'PlayfulButton';

/**
 * Icon Button - Square button with just an icon
 */
interface IconButtonProps extends Omit<PlayfulButtonProps, 'children' | 'icon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, size = 'md', ...props }: IconButtonProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <PlayfulButton
      size={size}
      className={cn('!p-0', sizeMap[size])}
      {...props}
    >
      {icon}
    </PlayfulButton>
  );
}

/**
 * Floating Action Button - For primary actions
 */
interface FABProps extends PlayfulButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  position = 'bottom-right',
  children,
  icon,
  ...props
}: FABProps) {
  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('fixed z-40', positionStyles[position])}
    >
      <PlayfulButton
        variant="playful"
        size="lg"
        icon={icon}
        className="shadow-2xl"
        {...props}
      >
        {children}
      </PlayfulButton>
    </motion.div>
  );
}

/**
 * Button Group - For related actions
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
  children,
  className,
  orientation = 'horizontal',
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row gap-2' : 'flex-col gap-2',
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}
