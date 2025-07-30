import { describe, it, expect } from "vitest";
import { AR, POSITION, PICTURE_BETS, View } from "./game_logic";

describe("coordinate matrix sum", () => {
    const test_cases = {
        [POSITION.ZERO]: 116,
        [POSITION.ZERO_TOP]: 129,
        [POSITION.ZERO_MID]: 165,
        [POSITION.ZERO_BOT]: 129,
        [POSITION.CENTER_TOP]: 123,
        [POSITION.CENTER_MID]: 156,
        [POSITION.CENTER_BOT]: 123,
        [POSITION.COLUMN_TOP]: 93,
        [POSITION.COLUMN_MID]: 118,
        [POSITION.COLUMN_BOT]: 93
    }
    for (let key in test_cases) {
        it(`view with position ${key} should return ${test_cases[key]} which is the sum of all available positions`, () => {
            // Arrange
            const view = new View([AR.SU], key, View.place_flat)
            // Act
            const result = view.coordinate_matrix.reduce((int, chip) => int + chip.position, 0)
            // Assert
            expect(result).toBe(test_cases[key])
        })
    }
})
describe("picture bet validity", () => {
    for (let key in PICTURE_BETS.pbs) {
        it(`picture bet ${key}'s positions should sum to ${key}`, () => {
            // Arrange
            // Act
            // Assert
            expect(PICTURE_BETS.pbs[key].reduce((a, b) => a + b, 0)).toBe(parseInt(key))
        })
    }
})