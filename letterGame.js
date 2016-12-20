// Globol variables
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var lettersArray = [];
var animalsArray = [];
var fallingElements = [];
var explosionArray = [];
var hault = false
var base = parseInt(width/26)
var baseLine = 100;
var barHeight = 100
var movement = 10
var selectSpped = 1000
var fallingSpeed = 450
var selectTimerID
var fallingTimerID
var hit = 0
var gg = false

// Remove Level-up picture
function disappearFlashImg(img, flash) {
    if (flash > 0) {
        if (img.style.visibility == "hidden") {
            img.style.visibility = "visible"
        } else {
            img.style.visibility = "hidden"
        }
        setTimeout(function() {disappearFlashImg(img, flash-1)}, 100)
    } else {
        if(img.id == "deathImg") {
			img.style.visibility = "visible"
            var locationPixal = parseInt(width/3) + "px"
            var defeatImg = createHtml_position("img", "defeatImg", locationPixal, barHeight+100 + "px", "35%", "")
            defeatImg.src                 = "images/defeat.png"
            defeatImg.style.position      = "absolute"
            document.body.appendChild(defeatImg)
        } else if (img.id == "deductionImg") {
			document.getElementById('heartDiv').removeChild(img)
			takeOfOneLife()
		} else if (img.id == "levelUpImg") {
			document.getElementById('jungleDiv').removeChild(img)
		} else {
            document.body.removeChild(img);
        }
    }
}
// Show level up information
function showLevelUp() {
	var levelUpImg  = createHtml_src("img", "levelUpImg", "images/level_up.png")
    document.getElementById("jungleDiv").appendChild(levelUpImg);
	setTimeout(function() {disappearFlashImg(levelUpImg, 5)}, 50)
}
// Check whether it should level up
function checkLevel() {
    hit ++
    document.getElementById('myScores').childNodes[0].nodeValue = "Scores: " + hit
    switch(hit%3) {
        case 2:
            selectSpped *= 0.95 
            fallingSpeed *= 0.99 
			document.getElementById("myLevel").childNodes[0].nodeValue = "Level: " + parseInt((hit/3) +1)
			clearTimers()
			startTimers()
			showLevelUp()
            break;
    }
}
// Reset the letter which was shot
function resetExplosedLetter(letter) {
    var randomLocation          = createLocation()
    letter.style.left           = randomLocation +"px"
    letter.style.top            = baseLine + "px"
    letter.style.bottom         = baseLine + base + "px"
    letter.className            = "unselected"
    letter.style.visibility     = "hidden"
}
// Animation (explosion)
function changeExplosionSrc(boomImg) {
    var explostionInfo;
    for(let i=0; i<explosionArray.length; i++) {
		if (explosionArray[i].img === boomImg) {
		    explostionInfo = explosionArray[i]
            break;
		}
    }
    if( explostionInfo != null) {
		var explosionCounter = explostionInfo.counter
        if (explosionCounter < 17) {
            boomImg.src = "images/explosion/explosion" + explosionCounter + ".png"
			explostionInfo.counter++
        } else {
            document.body.removeChild(boomImg)
			resetExplosedLetter(explostionInfo.letter)
			clearInterval(explostionInfo.timerID)
            var index = explosionArray.indexOf(explostionInfo)
            if (index > -1) {
                explosionArray.splice(index, 1)
            }
			bigBang()
        }
    }
}
// Create exploision picture and maintain it into array
function createExplosion(letter) {
    var explosionCounter = 2;
    var explosionImg = createHtml_position("img", ("explosionImg" + explosionCounter), 
            letter.style.left, letter.style.top, (base + 10 + "px"), (base + 10 + "px"))
    explosionImg.src                 = "images/explosion/explosion" + explosionCounter + ".png"
    explosionImg.style.position      = "absolute"
    explosionImg.style.right         = parseInt(letter.style.right+10) + "px"
    explosionImg.style.bottom        = parseInt(letter.style.bottom+10) + "px"
    document.body.appendChild(explosionImg)

    // Create timer
    var explosionTimerID = setInterval(function() { changeExplosionSrc(explosionImg)}, 80)
	var exploision = new Expoision(explosionTimerID, explosionImg, explosionCounter, letter);
    explosionArray.push(exploision)
}
// Class for explosion
function Expoision(timerID, img, counter, letter) {
	this.timerID = timerID;
	this.img = img
	this.counter = counter
	this.letter = letter
}
// remove one heart picture
function takeOfOneLife() {
    var heartDiv = document.getElementById('heartDiv')
    switch(heartDiv.childNodes.length) {
        case 3:
            heartDiv.removeChild(heartDiv.childNodes[2])
            break;
        case 2:
            heartDiv.removeChild(heartDiv.childNodes[1])
            break;
        case 1:
            heartDiv.removeChild(heartDiv.childNodes[0])
            endGame()
            break;
    }
}
// shot the wrong letters...
function decrease() {
	var deductionImg = createHtml_src("img", "deductionImg", "images/deduction.png")
	var heartDiv = document.getElementById("heartDiv")
	heartDiv.appendChild(deductionImg)
    setTimeout(function() {disappearFlashImg(deductionImg, 2)}, 50)
}
// Shot the letter with keyboard event
function shotThisLetter(object) {
    // Remove from the falling array
    var index = fallingElements.indexOf(object);
    if (index > -1) {
        fallingElements.splice(index, 1);
    }
    // Hidden the letter first
    object.style.visibility = "hidden";
    
    // Display exlopsion animation
    createExplosion(object)
    
    // level
    checkLevel()
}
function shotByClick() {
	shotThisLetter(this)
}
// use 'esc' to control our app
function switchOnorOff() {
    if (hault) {
        startTimers()
    } else {
        clearTimers()
    }
    hault = !hault;
}
// Keyboard events
function determinekey(e){
    var keyCode = null
    if(e.event) {
        keyCode = e.event
    } else if (e.which) {
        keyCode = e.which
    }
    
    if (keyCode === 27) {
        // Esc
        switchOnorOff()
        return
    } else if (hault) {
        return
    } else if (keyCode === 38) {
        // Up
        checkLevel()
        return
    }
    
	keyCode += 32
    // make sure that the user input is letter, 97 - 122
    if(keyCode >= 97 && keyCode <= 122) {
        var letter = String.fromCharCode(keyCode)
        //console.log(letter);
        var elements
        if ( (hit/3+1) >= 5 && document.getElementById("animal_" + letter).className == "falling") {
            elements = document.getElementById("animal_" + letter)
        } else if (document.getElementById(letter).className == "falling") {
            elements = document.getElementById(letter)
        } else {
            decrease()
            return;
        }
        shotThisLetter(elements)
    }
}
// Reset the timer
function clearTimers() {
    clearInterval(selectTimerID)
    clearInterval(fallingTimerID)
}
function startTimers() {
    selectTimerID = setInterval("selectNewElement()", selectSpped)
    fallingTimerID = setInterval("runFalling()", fallingSpeed)
}
function bigBang() {
	if(!gg) {
		return
	}
	var count = 0
	for(let i=0; i<lettersArray.length; i++) {
		if(count > 9) {
			break;
		}
		if (lettersArray[i].className == "falling") {
			createExplosion(lettersArray[i])
			count++
		} else if (animalsArray[i].className == "falling") {
			createExplosion(animalsArray[i])
			count++
		}
	}

}
function showRIPImg() {
	var heartDiv = document.getElementById('heartDiv')
	var deathImg = createHtml_src("img", "deathImg", "images/death.png")
	heartDiv.append(deathImg)
	setTimeout(function() {disappearFlashImg(deathImg, 5)}, 100)
}
// End game
function endGame() {
    hault = true
	gg = true
    clearTimers()
	showRIPImg()
    setTimeout("bigBang()", 50)
}
// Second timer: go through the falling array and make them falling
function runFalling() {
    for (let i=0; i < fallingElements.length; i++) {
        var  selectedLetter = fallingElements[i]
        if ((parseInt(selectedLetter.style.bottom) + movement) > height) {
            selectedLetter.style.bottom = (height) + "px"
            selectedLetter.style.top = (height - base) + "px"
            // have extra lifes 
            if (document.getElementById('heartDiv').childNodes.length >= 1) {
                selectedLetter.style.visibility = "hidden"
                resetExplosedLetter(selectedLetter)
                decrease() 
            } else {
                endGame()
            }
        } else {
            selectedLetter.style.bottom = parseInt(selectedLetter.style.bottom) + movement + "px"
            selectedLetter.style.top = parseInt(selectedLetter.style.top) + movement + "px"
        }   
        if (parseInt(selectedLetter.style.top) > barHeight ) {
            selectedLetter.style.visibility     = "visible"
        }
    }
}
// First timer: Randomly selct a letter
function selectNewElement() {
    // First, check whether the randomly selected letter is not falling
    var selectedElement
    do {
        var selectedIndex = parseInt((Math.random()*100)%26)
		// If the level is higher than 5, it is possible to fall the animinal pictures
        if ((hit/3+1) >= 5 && lettersArray[selectedIndex].className == "unselected" && (parseInt((Math.random()*100)%2) == 0)) {
            selectedElement = animalsArray[selectedIndex]
        } else {
            selectedElement = lettersArray[selectedIndex]
        }
    } while(selectedElement.className != "unselected"  && document.getElementsByClassName("falling").length < 26)
    // Add the selected letters to the falling array
	if(selectedElement != null) {
		selectedElement.className = "falling"
		fallingElements.push(selectedElement)
	}
}
function createLocation( ) {
    return ((parseInt((Math.random()*100)%25)) * base )
}
function setupLeters() {
    // Main div
	var jungleDiv = createHtml("div", "jungleDiv")
	jungleDiv.style.height = (height - barHeight - 20) + "px";
    jungleDiv.style.backgroundImage = "url('images/bg.jpg')";
    jungleDiv.style.backgroundSize = "cover";

    // 97 - 122
    var first = "a"
	var last  = "z"
	for (let i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
		letter                  = eval("String.fromCharCode(" + i + ")")
        // Letters
        var img                 = createHtml_position("img", letter, createLocation() +"px", 
                                        baseLine + "px", base+ "px", base+ "px")
        img.src                 = "images/letters/" + letter + ".png"
        img.style.bottom        = baseLine + base + "px"
        img.style.position      = "absolute"
        img.className           = "unselected"
        img.style.visibility    = "hidden"
        jungleDiv.appendChild(img);
        lettersArray.push(img);
        
        // Animals
        var animalImg                 = createHtml_position("img", "animal_" + letter, createLocation() +"px", 
                                        baseLine + "px", base+ "px", base+ "px")
        animalImg.src                 = "images/animals/animal_" + letter + ".png"
        animalImg.style.bottom        = baseLine + base + "px"
        animalImg.style.position      = "absolute"
        animalImg.className           = "unselected"
        animalImg.style.visibility    = "hidden"
        jungleDiv.appendChild(animalImg);
        animalsArray.push(animalImg);        
	}
    document.body.appendChild(jungleDiv)
}
function setupBar() {
	var barDiv = createHtml("div", "barDiv")
	
    // First
	var myLogo = createHtml_src("img", "myLogo", "images/logo.jpg")
    barDiv.appendChild(myLogo)
	
    // Second     
	var heartDiv = createHtml("div", "heartDiv")
    for (let i=1; i<=3; i++) {
		var myLifes = createHtml_src("img", ("heart"+i), "images/heart.png")
		myLifes.className = "hearts"
        heartDiv.appendChild(myLifes)
        barDiv.appendChild(heartDiv)
    }
	
    // Third
	var levelDiv = createHtml("div", "levelDiv")
	var myLevel = createHtml("h1", "myLevel")
    var myLevelTextNode = document.createTextNode("Level: " + parseInt(hit/3)+1)
    myLevel.appendChild(myLevelTextNode)
    levelDiv.appendChild(myLevel)
    barDiv.appendChild(levelDiv)
	
    // Forth
	var scorceDiv = createHtml("div", "scorceDiv")
	var myScores = createHtml("h1", "myScores")
    var myScoresTextNode = document.createTextNode("Score: 0")
	
    myScores.appendChild(myScoresTextNode)
    scorceDiv.appendChild(myScores)
    barDiv.appendChild(myScores)
    document.body.appendChild(barDiv)
}
// Start
function start() {
    document.body.removeChild(this.parentElement)
    setupBar()
    setupLeters()
    startTimers();
    onkeyup = determinekey
}
// For creating html element
function createHtml_position(type, id, left, top, width, height) {
    var element = createHtml(type, id)
    element.style.left           = left
    element.style.top            = top
    element.style.width          = width
    element.style.height         = height
    element.onclick              = shotByClick
    return element
}
function createHtml_src(type, id, src) {
	var element = createHtml(type, id)
	element.src = src
	return element
}
function createHtml(type, id) {
	var element = document.createElement(type)
    element.id  = id
	return element
}
// Show the greeting screen
function init() {
	var greetingDiv = createHtml("div", "greetingDiv")

    // Greeting Title
    var greetingTitle = createHtml_src("img", "greetingTitle", "images/letterCrush.png")
	greetingDiv.appendChild(greetingTitle)

    // Greeting Img
    var greetingImg	= createHtml_src("img", "greetingImg", "images/press_start.jpg")
    greetingImg.onclick = start

	greetingDiv.appendChild(greetingImg)
	document.body.appendChild(greetingDiv)
}
// Ready
window.onload = function(){
	console.log(width + " " + height)
    init()
}