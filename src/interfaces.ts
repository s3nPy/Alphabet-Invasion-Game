export interface Letter {
    letter: string
    pos: number
}

export interface State {
    score: number
    speed: number
    lives: number

    reset(): void
}