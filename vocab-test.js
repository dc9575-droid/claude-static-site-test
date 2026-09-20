(() => {
  const TESTS = {
    vocab: { title: 'Vocab Challenge', dataKey: 'vocab' },
    proverbs: { title: 'Proverbs Challenge', dataKey: 'proverbs' },
    plurals: { title: 'Plural Rules', dataKey: 'plurals' },
    silent: { title: 'Silent Letters', dataKey: 'silent' },
  };

  const QUESTIONS_PER_TEST = 10;
  const AUTO_ADVANCE_DELAY = 700;

  const pickerSection = document.getElementById('pickerSection');
  const quizSection = document.getElementById('quizSection');
  const resultsSection = document.getElementById('resultsSection');

  const quizTitle = document.getElementById('quizTitle');
  const quizProgress = document.getElementById('quizProgress');
  const quizScore = document.getElementById('quizScore');
  const quizPrompt = document.getElementById('quizPrompt');
  const quizOptions = document.getElementById('quizOptions');
  const quizExplanation = document.getElementById('quizExplanation');
  const quizNext = document.getElementById('quizNext');

  const resultsScore = document.getElementById('resultsScore');
  const resultsFeedback = document.getElementById('resultsFeedback');
  const retryBtn = document.getElementById('retryBtn');
  const anotherTestBtn = document.getElementById('anotherTestBtn');

  let currentTestKey = null;
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let autoAdvanceTimer = null;

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
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    answered = false;

    const q = currentQuestions[currentIndex];
    quizProgress.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
    quizScore.textContent = `${score} / ${currentIndex}`;
    quizPrompt.textContent = q.prompt;

    quizExplanation.hidden = true;
    quizExplanation.textContent = '';
    quizNext.hidden = true;
    quizNext.disabled = true;

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
    if (answered) return; // guard: an answer was already registered for this question
    answered = true;

    const q = currentQuestions[currentIndex];
    const buttons = Array.from(quizOptions.children);
    const isCorrect = selectedIndex === q.correctIndex;

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correctIndex) {
        btn.classList.add('correct');
      } else if (i === selectedIndex) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      score += 1;
    }
    quizScore.textContent = `${score} / ${currentIndex + 1}`;

    if (isCorrect) {
      // Correct: brief highlight, then auto-advance -- no explanation needed.
      autoAdvanceTimer = setTimeout(nextQuestion, AUTO_ADVANCE_DELAY);
    } else {
      // Wrong: show why, and require an explicit click to continue.
      quizExplanation.textContent = q.explanation || '';
      quizExplanation.hidden = !q.explanation;
      quizNext.hidden = false;
      quizNext.disabled = false;
    }
  }

  function nextQuestion() {
    if (!answered) return; // guard: cannot advance without an answer registered
    currentIndex += 1;
    if (currentIndex >= currentQuestions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function animateScoreCount(target, total, duration) {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(progress * target);
      resultsScore.textContent = `${value} / ${total}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
    // Safety net: rAF is throttled/paused on background or non-rendering tabs,
    // so guarantee the final value lands even if animation frames never fire.
    setTimeout(() => {
      resultsScore.textContent = `${target} / ${total}`;
    }, duration + 50);
  }

  function showResults() {
    const total = currentQuestions.length;

    let feedback;
    if (score >= total * 0.8) {
      feedback = "That's a strong score — you've got a good handle on this. Well done!";
    } else if (score >= total * 0.5) {
      feedback = "You've got the basics down, but a few of the trickier ones caught you out. Our Spoken English course can help you close those gaps.";
    } else {
      feedback = "Worth another look. A quick chat with our team can walk you through the ones you missed, and our Spoken English course could really help.";
    }
    resultsFeedback.textContent = feedback;
    resultsScore.textContent = `0 / ${total}`;

    showSection(resultsSection);
    animateScoreCount(score, total, 800);
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
