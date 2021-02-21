const avail = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new avail();

let recogInputState = 0;
// 0 is for command
// 1 is for data entry
// 2 is for confirmation for clear
// 3 is for confirmation for delete current
// 4 for data entry ans

let CurrentCard = -1;
let CardBase = [{
    question: "Welcome! Commands are 'new', 'next', 'previous', 'delete', 'delete all', 'flip', and 'speak'! Press j and speak to interact!",
    answer: "The flash card is flipped!"
}];
let CardFlipped = false;
let new_card = {
    question:'',
    answer:''
}

recog.onstart = () => {
    // console.log('say something');
}

const interpretCommand = (c) => {
    console.log(c);
    const head = document.getElementById('title');
    if (recogInputState == 0) {
        if (c=='previous'){
            if (CurrentCard > 0){
                CurrentCard = CurrentCard - 1;
                CardFlipped = false;
            }
            updateCard();
        } else if (c=='next'){
            if (CurrentCard < CardBase.length - 1){
                CurrentCard = CurrentCard + 1;
                CardFlipped = false;
            }
            updateCard();
        } else if (c=='new'){
            head.textContent = 'Speak the question';
            recogInputState = 1;
        } else if (c=='delete all'){
            head.textContent = 'Are you sure you want to clear all?';
            recogInputState = 2; 
        } else if (c=='delete'){
            head.textContent = 'Are you sure you want to delete this?';
            recogInputState = 3;
        } else if (c=='flip'){
            CardFlipped = !CardFlipped;
            updateCard();
        } else if (c=='speak'){
            if (CurrentCard < 0){
                speakCardContent('There are no cards!');
            } else {
                if (!CardFlipped){
                    speakCardContent(CardBase[CurrentCard].question);
                } else {
                    speakCardContent(CardBase[CurrentCard].answer);
                }
            }
        }
    } else if (recogInputState === 1) {
        new_card = {
            question:'',
            answer:''
        }
        new_card.question = c;
        head.textContent = 'Speak the answer';
        recogInputState = 4;
    } else if (recogInputState === 2) {
        if (c == 'yes'){
            clearCardBase();
            updateCard();
            recogInputState = 0;
            head.textContent = 'Seagull';
        } else if (c == 'no') {
            recogInputState = 0;
            head.textContent = 'Seagull';
        }
    } else if (recogInputState === 3) {
        if (c == 'yes'){
            removeFromCardBase(CurrentCard);
            updateCard();
            recogInputState = 0;
            head.textContent = 'Seagull';
        } else if (c == 'no') {
            recogInputState = 0;
            head.textContent = 'Seagull';
        }
    } else if (recogInputState === 4) {
        new_card.answer = c;
        head.textContent = 'Seagull';
        recogInputState = 0;
        addToCardBase(new_card);
        updateCard();
    }
}

recog.onresult = (e) => {
    let speech = e.results[e.resultIndex][0].transcript;
    interpretCommand(speech.toLowerCase().trim());
}

document.onkeypress = function (e) {
    e = e || window.event;
    if (e.key==='j'){
        recog.start();
    }
};

const speakCardContent = (msg) => {
    const output = new SpeechSynthesisUtterance();
    output.text = msg; 
    output.volume = 1;
    output.rate = 1;
    output.pitch = 1;
    window.speechSynthesis.speak(output);
}

const loadCardBase = () => {
    if (localStorage.getItem('cardbase') === null){
        localStorage.setItem('cardbase', JSON.stringify(CardBase));
    } else {
        CardBase = JSON.parse(localStorage.getItem('cardbase'));
    }
    CurrentCard = CardBase.length - 1;
}

const addToCardBase = (card) => {
    CardBase.push(card);
    CurrentCard = CardBase.length - 1;
    localStorage.setItem('cardbase', JSON.stringify(CardBase));
    CardFlipped = false;
}

const removeFromCardBase = (index) => {
    CardBase.splice(index, 1);
    if (CurrentCard>0){
        CurrentCard = CurrentCard - 1;
    }
    if (CardBase.length === 0){
        CurrentCard = -1;
    }
    localStorage.setItem('cardbase', JSON.stringify(CardBase));
    CardFlipped = false;
}

const clearCardBase = () => {
    CardBase = [];
    CurrentCard = -1;
    localStorage.setItem('cardbase', JSON.stringify(CardBase));
}

const updateCard = () => {
    cc = document.getElementById('card-content');
    if (CurrentCard < 0){
        cc.textContent = 'There are no cards!';
    } else {
        if (!CardFlipped){
            cc.textContent = CardBase[CurrentCard].question;
        } else {
            cc.textContent = CardBase[CurrentCard].answer;
        }
    }
    const pageno = document.getElementById('page-number');
    pageno.textContent = (CurrentCard+1).toString() + '/' + CardBase.length;
}

window.addEventListener('load', () => {
    loadCardBase();
    updateCard();
})
