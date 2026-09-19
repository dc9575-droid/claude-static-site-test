(() => {
  const TESTS = {
    vocab: { title: 'Vocab Challenge', dataKey: 'vocab' },
    proverbs: { title: 'Proverbs Challenge', dataKey: 'proverbs' },
    plurals: { title: 'Plural Rules', dataKey: 'plurals' },
    silent: { title: 'Silent Letters', dataKey: 'silent' },
  };

  const QUESTIONS_PER_TEST = 10;

  const pickerSection = document.getElementById('pickerSection');
  const quizSection = document.getElementById('quizSection');
  const resultsSection = document.getElementById('resultsSection');

  const quizTitle = document.getElementById('quizTitle');
  const quizProgress = document.getElementById('quizProgress');
  const quizScore = document.getElementById('quizScore');
  const quizPrompt = document.getElementById('quizPrompt');
  const quizOptions = document.getElementById('quizOptions');
  const quizNext = document.getElementById('quizNext');

  const resultsScore = document.getElementById('resultsScore');
  const resultsFeedback = document.getElementById('resultsFeedback');
  const retryBtn = document.getElementById('retryBtn');
  const anotherTestBtn = document.getElementById('anotherTestBtn');

  let currentTestKey = null;
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showSection(section) {
    [pickerSection, quizSection, resultsSection].forEach((s) => {
      s.hidden = s !== section;
    });
    window.scrollTo({ top: section.offsetTop - 120, behavior: 'smooth' });
  }

  function startTest(testKey) {
    const bank = window.QUIZ_DATA[TESTS[testKey].dataKey] || [];
    currentTestKey = testKey;
    currentQuestions = shuffle(bank).slice(0, QUESTIONS_PER_TEST);
    currentIndex = 0;
    score = 0;
    quizTitle.textContent = TESTS[testKey].title;
    showSection(quizSection);
    renderQuestion();
  }

  function renderQuestion() {
    const q = currentQuestions[currentIndex];
    quizProgress.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
    quizScore.textContent = `${score} / ${currentIndex}`;
    quizPrompt.textContent = q.prompt;
    quizNext.hidden = true;

    quizOptions.innerHTML = '';
    q.options.forEach((option, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = option;
      btn.addEventListener('click', () => selectAnswer(i));
      quizOptions.appendChild(btn);
    });
  }

  function selectAnswer(selectedIndex) {
    const q = currentQuestions[currentIndex];
    const buttons = Array.from(quizOptions.children);

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correctIndex) {
        btn.classList.add('correct');
      } else if (i === selectedIndex) {
        btn.classList.add('incorrect');
      }
    });

    if (selectedIndex === q.correctIndex) {
      score += 1;
    }
    quizScore.textContent = `${score} / ${currentIndex + 1}`;
    quizNext.hidden = false;
  }

  function nextQuestion() {
    currentIndex += 1;
    if (currentIndex >= currentQuestions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function showResults() {
    const total = currentQuestions.length;
    resultsScore.textContent = `${score} / ${total}`;

    let feedback;
    if (score >= total * 0.8) {
      feedback = "That's a strong score — you've got a good handle on this. Well done!";
    } else if (score >= total * 0.5) {
      feedback = "You've got the basics down, but a few of the trickier ones caught you out. Our Spoken English course can help you close those gaps.";
    } else {
      feedback = "Worth another look. A quick chat with our team can walk you through the ones you missed, and our Spoken English course could really help.";
    }
    resultsFeedback.textContent = feedback;

    showSection(resultsSection);
  }

  document.getElementById('testPicker').addEventListener('click', (e) => {
    const startBtn = e.target.closest('.test-start');
    const card = e.target.closest('.test-card');
    if (startBtn || card) {
      const testKey = card.dataset.test;
      startTest(testKey);
    }
  });

  quizNext.addEventListener('click', nextQuestion);

  retryBtn.addEventListener('click', () => startTest(currentTestKey));

  anotherTestBtn.addEventListener('click', () => showSection(pickerSection));
})();
