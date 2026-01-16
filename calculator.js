
function styleGrid(cols, rows, elementsDiv) {
    elementsDiv.style.display = 'grid'
    elementsDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    elementsDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`

}


const calcEl = document.getElementById("calculator")
const buttons = calcEl.querySelector(".calculator-buttons")
const display = document.getElementById("display")


function setup() {
    styleGrid(4, 5, buttons)

    buttons.addEventListener("click", (e) => {
        const btn = e.target.closest("button")
        if (!btn) return

        const symbol = btn.dataset.symbol
        if (!symbol) return

        dispatch(symbol)
    })

}

setup()

function updateDisplay() {

    if (displayOverride !== null) {
        display.textContent = displayOverride
        return
    }

    
    const result = [...token_arr.map(t => {
        if (t.value) {
            return t.value;
        } else {
            return "";
        }
    }),digitStringBuffer]

    display.textContent = result.join(" ")

}







const TOKEN_DEFS = {
    digit: {
        test: ch => ch >= "0" && ch <= "9" || ch === ".",
        emit: ch => ({ kind: "digit", value: ch })
    },

    add: {
        test: ch => ch === "+",
        emit: () => ({ kind: "op", op: "add", precedence: 1 ,value: "+"})
    },

    sub: {
        test: ch => ch === "-",
        emit: () => ({ kind: "op", op: "sub", precedence: 1,value: "-" })
    },

    mul: {
        test: ch => ch === "*",
        emit: () => ({ kind: "op", op: "mul", precedence: 2,value: "×"})
    },

    div: {
        test: ch => ch === "/",
        emit: () => ({ kind: "op", op: "div", precedence: 2 , value: "÷"})
    },
    power: {
        test: ch => ch === "^",
        emit: () => ({kind: "op", op: "power", precedence: 3, value: "^" })
    },

    clear: {
        test: ch => ch === "clear",
        emit: () => ({ kind: "command", name: "clear", value: ""})
    },

    execute: {
        test: ch => ch === "=",
        emit: () => ({kind: "command", name:"execute"})
    },

}

const OPS = {
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    div: (a, b) => {
        if (b === 0) {
            throw new Error("Div by zero undefined")
        } else {
            return a/b
        }
    },
    power: (a,b) => a ** b,
}


let token_arr = []
let digitStringBuffer = ""
let displayOverride = null



function flushNumber() {
    if (!digitStringBuffer) return

    token_arr.push({
        kind: "number",
        value: parseFloat(digitStringBuffer)
    })

    digitStringBuffer = ""
}

function classify(symbol) {
    for (const def of Object.values(TOKEN_DEFS)) {
        if (def.test(symbol)) {
            return def.emit(symbol)
        }
    }
    return null
}

const HANDLERS = {
    digit: (t) => {
       digitStringBuffer += t.value
    },
    op: (t) => {
        flushNumber()

        const last = token_arr[token_arr.length - 1]

        if (!last || last.kind === "op") {
            token_arr[token_arr.length - 1] = t

        } else {
            token_arr.push(t)
        }


        
    },
    command: (t) => {

        if (t.name === "clear") {
            clearDisplay()
        }
        if (t.name === "execute") {
            
            try {
                execute()
                displayOverride = null
            } catch (err) {
                clearDisplay()
                displayOverride = err.message
                
            }
            
        }
    }

}

function execute() {
    flushNumber()

    if (token_arr.length === 0) return

    const result = evaluate(token_arr)

    // reset state and put result in token arr
    token_arr = [{
        kind: "number",
        value: result
    }]

    digitStringBuffer = ""
}

function clearDisplay() {
    token_arr = []
    digitStringBuffer = ""
}

function dispatch(symbol) {
    if (displayOverride !== null) {
        displayOverride = null
    }

    const token = classify(symbol)
    if (!token) return
    //dynamically calls handler with optional chaining operator
    HANDLERS[token.kind]?.(token)

    updateDisplay()
   
}

function reduce(tokens, minPrecedence) {
    const out = []

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]

        if (t.kind === "number") {
            out.push(t)
        } else if (t.kind === "op" && t.precedence >= minPrecedence) {
            const left = out.pop().value
            const right = tokens[++i].value
            const result = OPS[t.op](left, right)

            out.push({ kind: "number", value: result })
        } else {
            out.push(t)
        }
    }

    return out
}
function evaluate(tokens) {
    let t = tokens
    
    for (let index = 3; index > 0; index--) {
        t = reduce(t, index) 
    }

    return t[0].value
}

let prevKey = ""
document.addEventListener('keydown', (e) => {
    
    const k = e.key

    if (k === "Enter") {
        dispatch("=")
    } else if (k === "Backspace" || k === "Clear") {
        dispatch("clear")
    } else if (prevKey === "*" && k === "*") {
        dispatch("^")
    } else {
        dispatch(k)
    } 

    prevKey = k
        

        
});





