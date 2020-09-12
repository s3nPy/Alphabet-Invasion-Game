export default class HTMLSelector {
    static score: HTMLElement = document.querySelector('#score') as HTMLElement
    static speed: HTMLElement = document.querySelector('#speed') as HTMLElement
    static lives: HTMLElement = document.querySelector('#lives') as HTMLElement
    
    static menu: HTMLElement = document.querySelector('#menu') as HTMLElement
    static button: HTMLElement = document.querySelector('#menu > #btn') as HTMLElement
    static content: HTMLElement = document.querySelector('#content') as HTMLElement
}