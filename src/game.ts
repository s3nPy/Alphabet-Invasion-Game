import { BehaviorSubject, fromEvent, interval, combineLatest, Subscription } from 'rxjs';
import { map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators'
import { State, Letter }from './interfaces'
import HTMLSelector from './selector';

function generateLetter(): string {
    const code = Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0) ) + 'a'.charCodeAt(0)
    return String.fromCharCode(code)
}

function generatePosition(max=30): number {
    return ~~(Math.random()*max)
}

const maxLetters = ((): number => {
    const paperStyles = window.getComputedStyle(document.querySelector('#paper')!)
    const headerStyles = window.getComputedStyle(document.querySelector('#header')!)
    const contentHeight = Number.parseFloat(paperStyles.height) - Number.parseFloat(headerStyles.height)
    return Math.round(contentHeight / Number.parseFloat(paperStyles.lineHeight))
})()


const state: State = {
    lives: 3, score: 0, speed: 100,
    reset() {
        this.lives = 3
        this.score = 0
        this.speed = 100
    }
}

const letters: Letter[] = []

const tickspeed$ = new BehaviorSubject(state.speed)
const letters$ = tickspeed$.pipe(
    map(speed => 80000 / speed),
    switchMap(ms => {
        return interval(ms).pipe(
            map( () => {
                const letter: Letter = {
                    letter: generateLetter(),
                    pos: generatePosition()
                }
                letters.unshift(letter)
                return letters
            }),
        )
    })
)

const keys$ = fromEvent<KeyboardEvent>(document, 'keydown')
    .pipe(
        startWith({key: ''} as KeyboardEvent),
        map( (e: KeyboardEvent) => e.key.toLowerCase())
    )


const game$ = combineLatest([keys$, letters$])
        .pipe(
            tap(([key, letters]) => {
                if(letters.length && letters[letters.length-1].letter === key){
                    letters.pop()
                    state.score += state.speed * 10
                    state.speed += 5
                    tickspeed$.next(state.speed)
                }
                if(letters.length > maxLetters) {
                    letters.splice(0, letters.length)
                    state.lives--
                }
            }),
            takeWhile(() => state.lives > 0)
        )

function renderer([key, letters]: [string, Letter[]]) {
    HTMLSelector.score.textContent = `${state.score}`
    HTMLSelector.speed.textContent = `${state.speed}`
    HTMLSelector.lives.textContent = `${state.lives}`

    HTMLSelector.content.innerHTML = letters.reduce( (html, val) => {
        return html + '&nbsp;'.repeat(val.pos)+`${val.letter}<br/>`
    }, '')
}

function gameOverHandler() {
    HTMLSelector.button.textContent = 'RE-TRY';
    HTMLSelector.menu.hidden = false
    state.reset()
    tickspeed$.next(state.speed)
}

let sub: Subscription

fromEvent(HTMLSelector.button, 'click').subscribe( (e: Event) => {
    HTMLSelector.menu.hidden = true
    sub = game$.subscribe({
        next: renderer,
        complete: gameOverHandler
    })
})

fromEvent(document, 'keydown').subscribe((e: Event) => {
    if((e as KeyboardEvent).key === 'Escape' && sub) {
        sub.unsubscribe();
        HTMLSelector.button.textContent = 'RESUME';
        HTMLSelector.menu.hidden = false 
    }
})


// <!-- github.com/s3nPy -->