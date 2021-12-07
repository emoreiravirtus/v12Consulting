const dbUrl = 'http://localhost:8081/equations'

export class Board {

    userName = null;
    equation = null;
    result = null;
    savingStatus = null;
    successTooltip = null;
    errorTooltip = null;
    clearButton = null;
    equalButton = null;
    trySaveAgainButton = null;
    operators = [ '/', '+', '-', '*' ];
    numbers = [ 0, 1, 2, 3, 4, 5, 6, 8, 9];
    point = '.';
    temporaryObjectToSave = null;
    loading = null;

    constructor(
        userName,
        equation,
        result,
        successTooltip,
        errorTooltip,
        clearButton,
        equalButton,
        trySaveAgainButton,
        loading
    ) {

        this.userName = userName;
        this.equation = equation;
        this.result = result;
        this.successTooltip = successTooltip;
        this.errorTooltip = errorTooltip;
        this.clearButton = clearButton;
        this.equalButton = equalButton;
        this.trySaveAgainButton = trySaveAgainButton;
        this.loading = loading;

    }

    startLoading() {
        this.loading.style.display = 'flex';
    }

    stopLoading() {
        this.loading.style.display = 'none';
    }

    async checkSaveStatus() {

        const objectToDeal = this.getObjectToDeal();

        this.startLoading();

        await this.getServerStatus()
        .then(response => {
            this.savingStatus = response;

            this.setTemporaryObjectToSave( objectToDeal );  

            this.successTooltip.style.display = 'unset';
            this.errorTooltip.style.display = 'none';

            this.stopLoading();
        },
            error => {
                this.savingStatus = error;

                this.setTemporaryObjectToSave( null );
    
                this.errorTooltip.style.display = 'unset';
                this.successTooltip.style.display = 'none';

                this.stopLoading();
            }
        )
    
    }
    
    clearBoard = () => {

        this.equation.innerHTML = '0';
        this.result.innerHTML = '';
        
    }
    
    appendToEquation = ( input ) => {

        const lastItem = this.equation.innerHTML[ this.equation.innerHTML.length - 1 ];

        // Check if it is a number.
        if ( this.numbers.includes( input ) ) {

            if ( this.equation.innerHTML === '0') {

                this.equation.innerHTML = input;

            }
            else {

                this.equation.innerHTML += input;

            }
        }

        // Check if it is an operator and if equation is not empty.
        else if ( this.operators.includes( input ) && lastItem ) {

            // If the last item on equation is a number, it will append the operator.
            if ( this.numbers.includes( parseInt(lastItem) ) ) {
                this.equation.innerHTML += input;
            }
            // Else, it will change the current operator to the new selected one.
            else {
                this.equation.innerHTML = this.equation.innerHTML.slice(0, -1);
                this.equation.innerHTML = this.equation.innerHTML + input;
            }

        }

        // It's a dot ('.').
        else {

            // Check if equation is not empty.
            if( lastItem) {

                const separatedItems = this.getSeparatedItems();

                // It will append the '.' only once per item.
                if ( !separatedItems[ separatedItems.length - 1].includes('.') ) {

                    if( this.operators.includes(separatedItems[ separatedItems.length - 1]) ) {

                        this.equation.innerHTML += '0' + input;

                    }
                    else {

                        this.equation.innerHTML += input;

                    }
                
                }
            
            }

        }

    }

    // getSeparatedItems will convert the equation to an array of items.
    // i.e - `256-36/58*36` will be  ["256", "-", "36", "/", "58", "*", "36"].
    getSeparatedItems = () => {

        const fullEquations = this.equation.innerHTML;
        let items = [];

        for ( let c in fullEquations ) {
            
            let character = fullEquations[c]

            if ( this.operators.includes( character ) ) {
                
                items.push( character )
            
            }
            else {

                if( this.operators.includes( items[ items.length - 1 ] ) ) {

                    items.push( character );

                }
                else {

                    items.length >= 1 ? items[ items.length - 1 ] += character : items.push( character );

                }

            }

        }

        return items;

    }

    backspaceEquation = () => {

        if( this.equation.innerHTML != '' ) {
            this.equation.innerHTML = this.equation.innerHTML.slice(0, -1);
        }

    }

    getObjectToDeal() {

        return {
            userName: this.userName.value,
            equation: this.equation.innerHTML,
            time: Date.now()
        }

    }

    async handleEqualButtonClick () {

        let objectToDeal = this.getObjectToDeal();

        this.result.innerHTML = this.solveEquation( objectToDeal.equation );
        this.equation.innerHTML = objectToDeal.result;

        objectToDeal = {
            ...objectToDeal,
            result: this.result.innerHTML
        }

        this.saveEquation( objectToDeal );

        await this.getServerStatus()
        .then(response => {
            this.savingStatus = response;

            this.setTemporaryObjectToSave( objectToDeal );  

            this.successTooltip.style.display = 'unset';
            this.errorTooltip.style.display = 'none';
        },
            error => {
                this.savingStatus = error;

                this.setTemporaryObjectToSave( null );
    
                this.errorTooltip.style.display = 'unset';
                this.successTooltip.style.display = 'none';
            }
        )

    }

    solveEquation = ( equation ) => {

        // Call /solve-equation body - ( objectToSend ).
        // expect result as response.
        let result = this.mockGetResult(equation);

        return result;

    }

    saveEquation = ( objectToSave ) => {
        
        // Call /save-equation body - ( objectToSave ).
        // expect status as response.
        this.mockSaveEquation( objectToSave );
        return 'working';

    }

    setTemporaryObjectToSave( objectToDeal ) {

        this.temporaryObjectToSave = objectToDeal;

    }

    mockGetResult( equation ) {

        return eval( equation );

    }

    async mockSaveEquation( objectToSave ) {

        const response = await fetch(dbUrl, {
            method: 'POST',
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify( objectToSave )
          })
        return response.status;
    }

    async getStoredEquations() {
        const response = await fetch(dbUrl);
        return response.json();
    }

    async getServerStatus() {
        const response = await fetch(dbUrl);
        return response.status;
    }

    getSessionUserName() {  
        const userName = localStorage.getItem('calculatorUserName');
        let result;

        userName ? result = userName : result = 'Incognito';

        return result;
    }

    saveSessionUserName( name ) {
        localStorage.setItem('calculatorUserName', name);
    }

}