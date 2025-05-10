import {render, screen} from "@testing-library/react"
import Card from "./Card"

describe("Card Component" , () => {
    test('renders card with correct suit symbol', () => {
        render (<Card suit="hearts" rank="A" />)
        expect(screen.getByText("♥")).toBeInTheDocument()
        
        render (<Card suit="hearts" rank="A" />)
        expect(screen.getByText("♥")).toBeInTheDocument()
        
        render (<Card suit="hearts" rank="A" />)
        expect(screen.getByText("♥")).toBeInTheDocument()
        render (<Card suit="hearts" rank="A" />)
        expect(screen.getByText("♥")).toBeInTheDocument()
    })
})