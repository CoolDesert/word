// DOM元素
const wordDisplay = document.getElementById('wordDisplay');
const hintBtn = document.getElementById('hintBtn');
const hint = document.getElementById('hint');
const userInput = document.getElementById('userInput');
const checkBtn = document.getElementById('checkBtn');
const result = document.getElementById('result');
const nextBtn = document.getElementById('nextBtn');
const britishBtn = document.getElementById('britishBtn');
const americanBtn = document.getElementById('americanBtn');
const restartBtn = document.getElementById('restartBtn');

const roundWordsCount = 30; // 每轮单词数量
let currentWordIndex;
let currentWord;
let totalQuestions = 0;
let correctAnswers = 0;
let wrongWords = [];
let roundWords = [];
let unusedWords = [];

// 初始化错误统计
if (!localStorage.getItem('wordErrorStats')) {
    localStorage.setItem('wordErrorStats', JSON.stringify({}));
}
const errorStats = JSON.parse(localStorage.getItem('wordErrorStats'));

const voices = speechSynthesis.getVoices();

// 初始化
function initRound() {
    if (unusedWords.length + wrongWords.length < roundWordsCount) {
        unusedWords = [...words];
        shuffleArray(unusedWords);
    }
    roundWords = [...wrongWords, ...unusedWords];
    roundWords = roundWords.slice(0, roundWordsCount);
    shuffleArray(roundWords);
    unusedWords = unusedWords.slice(roundWordsCount - wrongWords.length);
    totalQuestions = 0;
    correctAnswers = 0;
    wrongWords = [];
    restartBtn.style.display = 'none';
    nextWord();
}

function nextWord() {
    if (roundWords.length === 0) {
        showResults();
        restartBtn.style.display = 'block'; // 显示再来一轮按钮
        return;
    }

    currentWord = roundWords.pop();
    wordDisplay.textContent = '';
    hint.textContent = '';
    userInput.value = '';
    result.textContent = '';
    userInput.focus();
    speakWord();
    showHint();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 显示中文提示
function showHint() {
    hint.textContent = currentWord.chinese;
}

// 检查答案
function checkAnswer() {
    const userAnswer = userInput.value.trim().toLowerCase();
    wordDisplay.textContent = currentWord.english;
    totalQuestions++;

    const isCorrect = userAnswer === currentWord.english.toLowerCase();
    showMarioAnimation(isCorrect);

    if (isCorrect) {
        result.textContent = '正确!';
        result.style.color = 'green';
        correctAnswers++;
    } else {
        result.textContent = `错误! 正确答案是: ${currentWord.english}`;
        result.style.color = 'red';
        wrongWords.push(currentWord);
    }

    // 显示统计信息
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    document.getElementById('stats').textContent = `正确率: ${accuracy}% (${correctAnswers}/${totalQuestions})`;

    // 更新错误统计
    updateErrorStats(isCorrect);

    // 3秒后自动下一题
    setTimeout(nextWord, 3000);
}

function showResults() {
    if (wrongWords.length > 0) {
        let wrongList = '答错的单词:\n';
        wrongWords.forEach(word => {
            wrongList += `${word.english} - ${word.chinese}\n`;
        });
        result.style.color = 'red';
        result.textContent = wrongList;
    }
}

// 显示马里奥动画
function showMarioAnimation(isCorrect) {
    const marioAnimation = document.getElementById('marioAnimation');
    if (isCorrect) {
        marioAnimation.style.backgroundImage = "url('mario_happy.jpeg')";
    } else {
        marioAnimation.style.backgroundImage = "url('mario_sad.jpeg')";
    }
    marioAnimation.style.display = 'block';
    marioAnimation.classList.add('animate');

    // 动画结束后隐藏
    setTimeout(() => {
        marioAnimation.style.display = 'none';
        marioAnimation.classList.remove('animate');
    }, 2000);
}

// 朗读单词
function speakWord(accent = 'en-GB', volume = 1.0) {
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = accent; // 设置语言
    utterance.volume = volume; // 设置音量
    const selectedVoice = voices.find(voice => voice.lang === accent); // 根据口音选择语音
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
}

// 事件监听
// hintBtn.addEventListener('click', showHint);
checkBtn.addEventListener('click', checkAnswer);
britishBtn.addEventListener('click', () => speakWord('en-GB'));
americanBtn.addEventListener('click', () => speakWord('en-US'));
restartBtn.addEventListener('click', initRound);

// 回车键检查答案
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// 获取错误率最高的10个单词
function getTopErrorWords() {
    const words = Object.keys(errorStats);
    return words
        .map(word => ({
            word,
            errorRate: errorStats[word].errors / errorStats[word].attempts
        }))
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 10);
}

// 显示错误率最高的单词
function showTopErrorWords() {
    const topWords = getTopErrorWords();
    const topWordsContainer = document.getElementById('topErrorWords');

    if (topWords.length === 0) {
        topWordsContainer.innerHTML = '<p>暂无统计数据</p>';
        return;
    }

    let html = '<ol>';
    topWords.forEach(item => {
        const wordData = words.find(w => w.english === item.word);
        const chinese = wordData ? wordData.chinese : '';
        html += `<li>${item.word} - ${chinese} (错误率: ${Math.round(item.errorRate * 100)}%)</li>`;
    });
    html += '</ol>';
    topWordsContainer.innerHTML = html;
}

function updateErrorStats(isCorrect) {
    if (!errorStats[currentWord.english]) {
        errorStats[currentWord.english] = { errors: 0, attempts: 0 };
    }
    errorStats[currentWord.english].attempts++;
    if (!isCorrect) {
        errorStats[currentWord.english].errors++;
    }
    localStorage.setItem('wordErrorStats', JSON.stringify(errorStats));
    showTopErrorWords();
}

// 初始化应用
initRound();
showTopErrorWords();
