// Sort the cards in the players hand
// by rank and

const rankOrder = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
]
const suitOrder = ["clubs", "diamonds", "hearts", "spades"]

const handSorter = (a, b) => {
  const suitComparison = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit)
  if (suitComparison !== 0) {
    return suitComparison
  }
  return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank)
}

export { handSorter }
