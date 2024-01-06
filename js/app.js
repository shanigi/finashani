'use strict'

const MINE = 'MINE'
const EMPTY = 'EMPTY'
const FLAG = 'FLAG'

const MINE_IMG = '<img src="img/mine icon.png">'
const FLAG_IMG = '<img src="img/flag.png">'

var gBoard
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    Beginner: { SIZE: 4, MINES: 2 },
    Medium: { SIZE: 8, MINES: 14 },
    Expert: { SIZE: 12, MINES: 32 }
}
var gCurrentLevel

function selectLevel(level) {
    var selectedLevel = {
        Beginner: { SIZE: 4, MINES: 2 },
        Medium: { SIZE: 8, MINES: 14 },
        Expert: { SIZE: 12, MINES: 32 }
    }[level]

    if (selectedLevel) {
        gCurrentLevel = selectedLevel
        console.log(`Selected Level: ${level} - Size: ${selectedLevel.SIZE} - Mines: ${selectedLevel.MINES}`)
        initGame()
    }
}

function initGame() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gBoard = buildBoard()
    renderBoard(gBoard)
    // document.getElementById('smiley').innerText = '😃'

    var cells = document.querySelectorAll('.board td')
    cells.forEach(function (cell, index) {
        cell.addEventListener('click', function () {
            var i = Math.floor(index / gCurrentLevel.SIZE)
            var j = index % gCurrentLevel.SIZE
            onCellClicked(cell, i, j)
        })
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault()
            var i = Math.floor(index / gCurrentLevel.SIZE)
            var j = index % gCurrentLevel.SIZE
            onCellRightClicked(cell, i, j)
        })
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function placeMines(board) {
    var minesToPlace = gCurrentLevel.MINES
    while (minesToPlace > 0) {
        var i = getRandomInt(0, gCurrentLevel.SIZE)
        var j = getRandomInt(0, gCurrentLevel.SIZE)
        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            minesToPlace--
        }
    }
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gCurrentLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gCurrentLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    placeMines(board)
    // console.table(board)
    return board
}

function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''
    if (!board || board.length === 0) {
        return
    }
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            const cellContent = cell.isMine ? '' : ''
            strHTML += `<td class="cell" onclick="onCellClicked(this, ${i}, ${j})">${cellContent}`

            if (cell.isMine && cell.isShown) {
                strHTML += MINE_IMG
            } else if (cell.isMarked) {
                strHTML += FLAG_IMG
                cell.isShown = true
            }

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(rowIdx, colIdx, board) {
    var minesAroundCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) minesAroundCount++
        }
    }
    return minesAroundCount
}

function onCellRightClicked(elCell, i, j) {
    var cell = gBoard[i] && gBoard[i][j]

    if (cell && cell.isShown) {
        return
    }

    cell.isMarked = !cell.isMarked

    if (cell.isMarked) {
        elCell.innerHTML = FLAG_IMG
        elCell.classList.add('mark')
        gGame.markedCount++
    } else {
        elCell.innerHTML = ''
        elCell.classList.remove('mark')
        gGame.markedCount--
    }

    checkGameOver()
}

function onCellClicked(elCell, i, j) {
    var cell = gBoard[i] && gBoard[i][j]

    if (!elCell || cell.isMarked) {
        return
    }

    if (cell.isMine) {
        elCell.innerHTML = MINE_IMG
        revealAllMines(elCell)
        checkGameOver()
    } else if (!cell.isShown) {
        cell.isShown = true
        cell.minesAroundCount = setMinesNegsCount(i, j, gBoard)
        elCell.innerHTML = cell.minesAroundCount
        gGame.shownCount++

        if (cell.minesAroundCount === 0) {
            expandShown(i, j, gBoard)
        }

        checkGameOver()
    }
}

function expandShown(board, elCell, rowIdx, colIdx) {
    for (var row = rowIdx - 1; row <= rowIdx + 1; row++) {
        if (row < 0 || row >= board.length) continue
        for (var col = colIdx - 1; col <= colIdx + 1; col++) {
            if (col < 0 || col >= board[row].length) continue
            var cureCell = board[row][col]
            if (!cureCell.isShown) {
                cureCell.isShown = true
                elCell.innerHTML = cureCell.minesAroundCount
                gGame.shownCount++
            }
            if (cureCell.minesAroundCount === 0) {
                expandShown(board, elCell, row, col)
            }
        }
    }
    renderBoard()
}


function revealAllMines(elCell) {
    for (var row = 0; row < gCurrentLevel.SIZE; row++) {
        for (var col = 0; col < gCurrentLevel.SIZE; col++) {
            var cell = gBoard[row][col]
            if (cell.isMine) {
                gBoard[row][col].isShown = true
                var mineCell = document.querySelector(`.board tr:nth-child(${row + 1}) td:nth-child(${col + 1})`)
                mineCell.innerHTML = MINE_IMG
            }
        }
    }
}

function checkGameOver() {
    var game = gGame
    var cellsCount = gCurrentLevel.SIZE * gCurrentLevel.SIZE
    var minesCount = gCurrentLevel.MINES
    var smileyButton = document.getElementById('smiley')
    for (var row = 0; row < gCurrentLevel.SIZE; row++) {
        for (var col = 0; col < gCurrentLevel.SIZE; col++) {
            var cell = gBoard[row][col]
            if (cell.isMine && cell.isShown) {
                game.isOn = false
                var smileyButton = document.getElementById('smiley')
                if (smileyButton) {
                    smileyButton.innerText = '😢'
                }
                // alert('Game over')
                console.log('Game over')
                // resetGame()
                return
            }
        }
    }
    if (game.markedCount === minesCount && game.shownCount === cellsCount - minesCount) {
        game.isOn = false
        if (smileyButton) {
            smileyButton.innerText = '😎'
        }
        console.log('You won!')
        alert('Congratulations! You won!')
        // resetGame()
    }
}

function resetGame() {
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    var smileyButton = document.getElementById('smiley')
    if (smileyButton) {
        smileyButton.innerText = '😃'
    }
    initGame()
}