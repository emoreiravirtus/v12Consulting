import { Board } from "./js/boardClass.js";

const userName = document.querySelector('[name=userName]');
const equation = document.querySelector('.equation');
const result = document.querySelector('.result');
const successTooltip = document.querySelector('.success');
const errorTooltip = document.querySelector('.error');
const clearButton = document.querySelector('.clearButton');
const equalButton = document.querySelector('.equalButton');
const trySaveAgainButton = document.querySelector('.trySaveAgain');
const loading = document.getElementById('load');

const board = new Board(
    userName,
    equation,
    result,
    successTooltip,
    errorTooltip,
    clearButton,
    equalButton,
    trySaveAgainButton,
    loading
);

// Script for ./history.html.
if ((document.location.href).includes('history.html')) {

    board.startLoading();

    await board.getStoredEquations()
    .then( response => { 

        const tableBody = document.querySelector('tbody');

        if( response.length == 0 ) {
            tableBody.innerHTML = 'No data stored yet.'
        }

        for ( let i in response ) {

            const equation = response[i];

            tableBody.innerHTML += `
                <tr>
                    <td>${ equation.userName }</td>
                    <td>${ equation.equation }</td>
                    <td>${ parseInt(equation.result).toFixed(2) }</td>
                    <td>${ new Date(equation.time).toDateString()  }</td>
                </tr>`

        }

        board.stopLoading();

     },
     error => {

        const tableBody = document.querySelector('tbody');

        console.error(error);

        tableBody.innerHTML = `
        <span style="color: darkred">
        No connection with database
        </span>`;

        board.stopLoading();
     } );

}

// Script for ./index.html.
else {

    board.userName.value = board.getSessionUserName();  

    board.checkSaveStatus();

    // EventListener for numbers.
    for ( let i = 0; i < 11; i++) {
        document.querySelector(`[data-number='${i}']`).addEventListener( 'click', () => {
            i != 10 ? board.appendToEquation(i) : board.appendToEquation('.');
        })
    }

    // EventListener for backspace.
    document.querySelector(`[data-number='11']`).addEventListener( 'click', () => {
        board.backspaceEquation();
    })

    // EventListener for operators.
    for ( let i = 0; i < 4; i++) {
        document.querySelector(`[data-operator='${i}']`).addEventListener( 'click', () => {
            switch(i) {
                case(0): {
                    board.appendToEquation('+')
                    break;
                }
                case(1): {
                    board.appendToEquation('-')
                    break;
                }
                case(2): {
                    board.appendToEquation('/')
                    break;
                }
                case(3): {
                    board.appendToEquation('*')
                    break;
                }
                default: {
                    throw new Error('invalid operator');
                }
            }
        })
    }

    // EventListener for clear the equation and result.
    board.clearButton.addEventListener( 'click', () => {
        board.clearBoard();
    });

    // EventListener for send the equation to API.
    board.equalButton.addEventListener( 'click', () => {
        board.handleEqualButtonClick();
    });

    // EventListener for try save again.
    board.trySaveAgainButton.addEventListener( 'click', () => {
        board.checkSaveStatus();
    });

    // EventListener for save userName.
    board.userName.addEventListener( 'keyup', () => {
        board.saveSessionUserName( board.userName.value );
    });

}

