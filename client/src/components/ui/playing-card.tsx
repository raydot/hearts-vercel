import * as React from "react"
import { cn } from "@/lib/utils"
import { Suit, Rank } from "@/types"

interface PlayingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  suit: Suit
  rank: Rank
  isPlayable?: boolean
  isSelected?: boolean
  isDisabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const PlayingCard = React.forwardRef<HTMLDivElement, PlayingCardProps>(
  ({ suit, rank, isPlayable, isSelected, isDisabled, size = 'md', className, ...props }, ref) => {
    const suitSymbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    }
    
    const isRed = suit === 'hearts' || suit === 'diamonds'
    const isQueenOfSpades = suit === 'spades' && rank === 'Q'
    
    const sizeClasses = {
      sm: 'w-[60px] h-[90px]',
      md: 'w-[80px] h-[120px]',
      lg: 'w-[100px] h-[150px]',
    }
    
    const cornerSizeClasses = {
      sm: 'text-[10px]',
      md: 'text-sm',
      lg: 'text-base',
    }
    
    const centerSizeClasses = {
      sm: 'text-2xl',
      md: 'text-4xl',
      lg: 'text-5xl',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative flex items-center justify-center",
          "bg-white border-2 border-black rounded-[10px]",
          "shadow-[2px_2px_5px_rgba(0,0,0,0.2)]",
          "transition-all duration-200",
          "select-none cursor-pointer",
          sizeClasses[size],
          
          // Color
          isRed ? "text-[#d40000]" : "text-black",
          
          // States
          !isDisabled && "hover:shadow-[0_10px_15px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:scale-105 hover:z-10",
          isPlayable && "shadow-[0_0_10px_rgba(0,255,0,0.5)] border-green-500 ring-2 ring-green-400/50",
          isSelected && "ring-4 ring-blue-500 -translate-y-4 scale-110 z-20",
          isDisabled && "opacity-50 cursor-not-allowed grayscale",
          isQueenOfSpades && "bg-purple-50 border-purple-500 shadow-[0_0_10px_rgba(128,0,128,0.5)]",
          
          className
        )}
        {...props}
      >
        {/* Top-left corner */}
        <div className={cn("absolute top-1 left-1 flex flex-col items-center font-bold leading-none", cornerSizeClasses[size])}>
          <span>{rank}</span>
          <span>{suitSymbols[suit]}</span>
        </div>
        
        {/* Center symbol */}
        <span className={centerSizeClasses[size]}>{suitSymbols[suit]}</span>
        
        {/* Bottom-right corner (rotated) */}
        <div className={cn("absolute bottom-1 right-1 flex flex-col items-center font-bold leading-none rotate-180", cornerSizeClasses[size])}>
          <span>{rank}</span>
          <span>{suitSymbols[suit]}</span>
        </div>
      </div>
    )
  }
)

PlayingCard.displayName = "PlayingCard"

export { PlayingCard }
