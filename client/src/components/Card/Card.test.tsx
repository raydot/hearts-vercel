import { describe, test, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Card from "./Card"

describe("Card Component", () => {
    // Clean up after each test to avoid conflicts between tests
    afterEach(() => {
        cleanup();
    });
    test('renders hearts symbol', () => {
        render(<Card suit="hearts" rank="A" />)
        expect(screen.getByTestId("card")).toBeInTheDocument()
        const cardElement = screen.getByTestId("card")
        expect(cardElement.textContent).toContain('♥')
    })
    
    test('renders diamonds symbol', () => {
        render(<Card suit="diamonds" rank="A" />)
        expect(screen.getByTestId("card")).toBeInTheDocument()
        const cardElement = screen.getByTestId("card")
        expect(cardElement.textContent).toContain('♦')
    })
    
    test('renders clubs symbol', () => {
        render(<Card suit="clubs" rank="A" />)
        expect(screen.getByTestId("card")).toBeInTheDocument()
        const cardElement = screen.getByTestId("card")
        expect(cardElement.textContent).toContain('♣')
    })

    test('renders spades symbol', () => {
        render(<Card suit="spades" rank="A" />)
        expect(screen.getByTestId("card")).toBeInTheDocument()
        const cardElement = screen.getByTestId("card")
        expect(cardElement.textContent).toContain('♠')
    })

    test('applies red color class to hearts', () => {
        render(<Card suit="hearts" rank="A" />)
        expect(screen.getByTestId("card")).toHaveClass("red")
    })
    
    test('applies red color class to diamonds', () => {
        render(<Card suit="diamonds" rank="A" />)
        expect(screen.getByTestId("card")).toHaveClass("red")
    })

    test('does not apply red color class to clubs', () => {
        render(<Card suit="clubs" rank="A" />)
        expect(screen.getByTestId("card")).not.toHaveClass("red")
    })

    test('does not apply red color class to spades', () => {
        render(<Card suit="spades" rank="A" />)
        expect(screen.getByTestId("card")).not.toHaveClass("red")
    })

    test('applies special styling to Queen of Spades', () => {
        render(<Card suit="spades" rank="Q" />)
        expect(screen.getByTestId("card")).toHaveClass("queen-of-spades")
    })
    
    test('does not apply special styling to other queens', () => {
        render(<Card suit="hearts" rank="Q" />)
        expect(screen.getByTestId("card")).not.toHaveClass("queen-of-spades")
    })

    test('has proper card dimensions and styling', () => {
        render(<Card suit="hearts" rank="A" />)
        const cardElement = screen.getByTestId("card")
        // We'll check for the presence of classes rather than specific styles
        // since the actual styles are applied via CSS
        expect(cardElement).toHaveClass("card")
        expect(cardElement).toHaveClass("red")
    })

    test('renders card corners correctly', () => {
        render(<Card suit="hearts" rank="10" />)
            const topLeftCorner = screen.getByTestId("top-left-corner")
            const bottomRightCorner = screen.getByTestId("bottom-right-corner")

            expect(topLeftCorner).toHaveTextContent('10')
            expect(topLeftCorner).toHaveTextContent('♥')
            expect(bottomRightCorner).toHaveTextContent('10')
            expect(bottomRightCorner).toHaveTextContent('♥')
        }
    )

test('applies hover effect on mouse enter', async () => {
    // Setup userEvent
    const user = userEvent.setup()
    
    // Create a mock function to track hover events
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    
    render(
        <Card 
            suit="hearts" 
            rank="A" 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
    const card = screen.getByTestId('card');
    
    // Verify initial state
    expect(onMouseEnter).not.toHaveBeenCalled();
    expect(onMouseLeave).not.toHaveBeenCalled();
    
    // Simulate hover
    await user.hover(card);
    
    // Check that onMouseEnter was called
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    
    // Simulate moving away
    await user.unhover(card);
    
    // Check that onMouseLeave was called
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
})
    
    test('calls onClick handler when clicked', async () => {
        // Setup userEvent
        const user = userEvent.setup()
        
        // Create a mock function for the onClick handler
        const handleClick = vi.fn()
        
        render(<Card suit="hearts" rank="A" onClick={handleClick} />)
        const card = screen.getByTestId('card')
        
        // Click the card
        await user.click(card)
        
        // Check that the onClick handler was called
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})