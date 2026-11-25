/* =========================================================
   EduRobotKZ — Advanced Animation Engine
   ========================================================= */

/* ========== 1. PARTICLE + MATRIX NETWORK ========== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, radius: 150 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 0.6;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.speedY = (Math.random() - 0.5) * 0.7;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.hue = Math.random() > 0.7 ? 300 : 180; // cyan or magenta
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse interaction — particles flee / attract
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force * 2.5;
                this.y -= (dy / dist) * force * 2.5;
                this.size = this.baseSize + force * 3;
            } else {
                this.size += (this.baseSize - this.size) * 0.1;
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(100, Math.floor(window.innerWidth / 12));
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 229, 255, ${0.12 * (1 - dist / 130)})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
        // Connect to mouse
        if (mouse.x !== null) {
            const dx = mouse.x - particles[i].x;
            const dy = mouse.y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 229, 255, ${0.25 * (1 - dist / mouse.radius)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========== 2. CUSTOM CURSOR ========== */
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let cursorX = 0, cursorY = 0, dotX = 0, dotY = 0;

document.addEventListener('mousemove', e => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    // Smooth follow for outer ring
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Lagging dot
    dotX += (cursorX - dotX) * 0.18;
    dotY += (cursorY - dotY) * 0.18;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover states
document.querySelectorAll('a, button, .option, .tab-btn, .practice-card, .about-card, .hw-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
    });
});

/* ========== 3. RIPPLE CLICK EFFECT ========== */
document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
});

/* ========== 4. NAVIGATION + SECTION TRANSITIONS ========== */
function navigateTo(sectionId) {
    const current = document.querySelector('.section.active');
    const next = document.getElementById(sectionId);
    if (!next || next === current) return;

    // Exit animation
    current.classList.add('section-exit');
    setTimeout(() => {
        current.classList.remove('active', 'section-exit');
        next.classList.add('active', 'section-enter');
        setTimeout(() => next.classList.remove('section-enter'), 600);

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`[data-section="${sectionId}"]`);
        if (link) link.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-trigger counters if home
        if (sectionId === 'home') setTimeout(animateCounters, 300);
        // Reveal animations
        observeReveals();
    }, 320);

    document.querySelector('.nav-links').classList.remove('open');
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-section'));
    });
});

document.getElementById('navToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
});

window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ========== 5. STAT COUNTERS ========== */
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
                // Pulse after finish
                el.parentElement.classList.add('stat-done');
            } else {
                el.textContent = Math.floor(current);
            }
        }, 25);
    });
}
if (document.getElementById('home').classList.contains('active')) {
    setTimeout(animateCounters, 600);
}

/* ========== 6. TYPING EFFECT FOR HERO ========== */
function typeWriter(element, text, speed = 45) {
    element.textContent = '';
    let i = 0;
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    cursorSpan.textContent = '|';
    element.appendChild(cursorSpan);

    function type() {
        if (i < text.length) {
            element.insertBefore(document.createTextNode(text[i]), cursorSpan);
            i++;
            setTimeout(type, speed + Math.random() * 30);
        } else {
            // Keep blinking cursor
            setInterval(() => {
                cursorSpan.style.opacity = cursorSpan.style.opacity === '0' ? '1' : '0';
            }, 530);
        }
    }
    type();
}

// Apply typing to subtitle after load
window.addEventListener('load', () => {
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const original = subtitle.textContent;
        typeWriter(subtitle, original, 40);
    }
});

/* ========== 7. SCROLL REVEAL (Intersection Observer) ========== */
function observeReveals() {
    const reveals = document.querySelectorAll('.about-card, .practice-card, .hw-card, .method-card, .platform, .theory-card, .author-card, .analysis-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => {
        el.classList.add('reveal-ready');
        observer.observe(el);
    });
}
observeReveals();

/* ========== 8. 3D TILT ON CARDS ========== */
document.querySelectorAll('.practice-card, .about-card, .hw-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 12;
        const rotateY = (centerX - x) / 12;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ========== 9. MAGNETIC BUTTONS ========== */
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

/* ========== 10. THEORY TABS ========== */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => {
            p.classList.remove('active');
            p.classList.add('tab-exit');
        });
        btn.classList.add('active');
        const pane = document.getElementById(btn.getAttribute('data-tab'));
        setTimeout(() => {
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('tab-exit'));
            pane.classList.add('active', 'tab-enter');
            setTimeout(() => pane.classList.remove('tab-enter'), 400);
        }, 150);
    });
});

/* ========== 11. PRACTICE SOLUTIONS ========== */
function showSolution(num) {
    const sol = document.getElementById(`sol${num}`);
    if (sol.style.display === 'none' || !sol.style.display) {
        sol.style.display = 'block';
        sol.classList.add('sol-enter');
    } else {
        sol.classList.remove('sol-enter');
        sol.style.display = 'none';
    }
}

/* ========== 12. COPY CODE ========== */
function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('code');
    navigator.clipboard.writeText(pre.textContent).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i>';
            btn.classList.remove('copied');
        }, 1600);
    });
}

/* ========== 13. QUIZ ========== */
const quizQuestions = [
    {
        q: "Білім беру робототехникасының негізгі мақсаты қандай?",
        options: ["Тек ойын-сауық үшін роботтар жасау", "STEM пәндерін практикалық түрде оқыту", "Тек бағдарламалауды үйрету", "Роботтарды сату"],
        correct: 1
    },
    {
        q: "Роботтың «миы» болып табылатын құрылғы қалай аталады?",
        options: ["Сенсор", "Мотор", "Микроконтроллер", "Батарея"],
        correct: 2
    },
    {
        q: "Python тілінде Arduino-мен жұмыс істеу үшін қай кітапхана жиі қолданылады?",
        options: ["numpy", "pyfirmata", "django", "flask"],
        correct: 1
    },
    {
        q: "Ультрадыбыстық сенсор (HC-SR04) не үшін қолданылады?",
        options: ["Түсті анықтау", "Қашықтықты өлшеу", "Температураны өлшеу", "Дыбысты жазу"],
        correct: 1
    },
    {
        q: "Line Follower роботы қандай сенсорларды пайдаланады?",
        options: ["Ультрадыбыстық", "Температура", "Инфрақызыл (IR) сенсорлар", "Гидрофон"],
        correct: 2
    },
    {
        q: "STEM қысқартуы нені білдіреді?",
        options: ["Science, Technology, Engineering, Math", "System, Tool, Engine, Machine", "Software, Testing, Electronics, Mechanics", "Sensor, Transistor, Energy, Motor"],
        correct: 0
    },
    {
        q: "Raspberry Pi несімен ерекшеленеді?",
        options: ["Тек блоктармен бағдарламаланады", "Толық Linux компьютері болып табылады", "Батареясыз жұмыс істейді", "Тек C++ тілін қолдайды"],
        correct: 1
    },
    {
        q: "Жобалық оқыту (PBL) әдісінде оқушылар не істейді?",
        options: ["Тек теорияны жаттап алады", "Нақты мәселені шешетін жоба жасайды", "Тек тест тапсырады", "Мұғалімнің дәрісін тыңдайды"],
        correct: 1
    },
    {
        q: "gpiozero кітапханасы қай платформа үшін арналған?",
        options: ["Arduino", "Windows", "Raspberry Pi", "iOS"],
        correct: 2
    },
    {
        q: "Роботтың қозғалысын қамтамасыз ететін құрылғылар қалай аталады?",
        options: ["Сенсорлар", "Актуаторлар (моторлар)", "Микроконтроллерлер", "Дисплейлер"],
        correct: 1
    }
];

let currentQuestion = 0;
let userAnswers = new Array(quizQuestions.length).fill(null);
let quizFinished = false;

function renderQuestion() {
    const q = quizQuestions[currentQuestion];
    const card = document.getElementById('quizCard');

    let optionsHtml = q.options.map((opt, i) => `
        <div class="option ${userAnswers[currentQuestion] === i ? 'selected' : ''}" onclick="selectOption(${i})">
            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="question-text">${currentQuestion + 1}. ${q.q}</div>
        <div class="options">${optionsHtml}</div>
    `;

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Сұрақ ${currentQuestion + 1} / ${quizQuestions.length}`;

    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    if (currentQuestion === quizQuestions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

function selectOption(index) {
    if (quizFinished) return;
    userAnswers[currentQuestion] = index;
    // Small bounce feedback
    const opts = document.querySelectorAll('.option');
    opts[index].classList.add('option-pop');
    setTimeout(() => opts[index].classList.remove('option-pop'), 300);
    renderQuestion();
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
});
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestion < quizQuestions.length - 1) { currentQuestion++; renderQuestion(); }
});
document.getElementById('submitBtn').addEventListener('click', () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0 && !confirm(`${unanswered} сұраққа жауап берілмеген. Нәтижені бәрібір көргіңіз келе ме?`)) return;
    showQuizResult();
});

function showQuizResult() {
    quizFinished = true;
    let correct = 0;
    const wrongQuestions = [];

    userAnswers.forEach((ans, i) => {
        if (ans === quizQuestions[i].correct) correct++;
        else wrongQuestions.push({
            num: i + 1,
            question: quizQuestions[i].q,
            yourAnswer: ans !== null ? quizQuestions[i].options[ans] : "Жауап берілмеген",
            correctAnswer: quizQuestions[i].options[quizQuestions[i].correct]
        });
    });

    const percent = Math.round((correct / quizQuestions.length) * 100);
    document.getElementById('quizContainer').style.display = 'none';
    const resultDiv = document.getElementById('quizResult');
    resultDiv.style.display = 'block';

    let grade = '', gradeColor = '';
    if (percent >= 90) { grade = 'Өте жақсы!'; gradeColor = 'var(--success)'; }
    else if (percent >= 70) { grade = 'Жақсы'; gradeColor = 'var(--primary)'; }
    else if (percent >= 50) { grade = 'Қанағаттанарлық'; gradeColor = 'var(--warning)'; }
    else { grade = 'Қайталау қажет'; gradeColor = 'var(--danger)'; }

    // Confetti for high scores
    if (percent >= 70) launchConfetti(percent >= 90 ? 120 : 60);

    let wrongHtml = '';
    if (wrongQuestions.length > 0) {
        wrongHtml = `<div class="result-details"><h4><i class="fas fa-exclamation-triangle"></i> Қате жауаптар (${wrongQuestions.length})</h4>
            ${wrongQuestions.map(w => `<div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border);">
                <strong>${w.num}. ${w.question}</strong><br>
                <span style="color:var(--danger);">Сіздің жауабыңыз: ${w.yourAnswer}</span><br>
                <span style="color:var(--success);">Дұрыс жауап: ${w.correctAnswer}</span>
            </div>`).join('')}</div>`;
    }

    resultDiv.innerHTML = `
        <div class="result-score score-pop" style="color:${gradeColor}">${percent}%</div>
        <div class="result-label">${grade} • ${correct} / ${quizQuestions.length} дұрыс</div>
        ${wrongHtml}
        <button class="btn btn-primary" onclick="retryQuiz()" style="margin-top:1rem;"><i class="fas fa-redo"></i> Қайта тапсыру</button>
        <button class="btn btn-outline" onclick="goToResultsAnalysis()" style="margin-top:1rem;margin-left:0.5rem;"><i class="fas fa-chart-bar"></i> Толық талдауға өту</button>
    `;

    updateResultsSection(percent, correct, wrongQuestions);
}

function retryQuiz() {
    currentQuestion = 0;
    userAnswers = new Array(quizQuestions.length).fill(null);
    quizFinished = false;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    renderQuestion();
}

function goToResultsAnalysis() {
    navigateTo('results');
}

function updateResultsSection(percent, correct, wrongQuestions) {
    document.getElementById('resultsPlaceholder').style.display = 'none';
    const content = document.getElementById('resultsContent');
    content.style.display = 'block';

    const scoreDeg = percent * 3.6;
    let recommendations = [];
    if (percent < 50) {
        recommendations = ["Теория бөліміндегі барлық 4 тақырыпты қайта қараңыз", "Практикалық тапсырмалардың шешімдерін мұқият зерттеңіз", "ЖИ көмекшісінен түсінбеген ұғымдарды сұраңыз", "Python негіздерін (айнымалы, цикл, шарт) қайталаңыз"];
    } else if (percent < 70) {
        recommendations = ["Қате жауап берген сұрақтардың тақырыптарын қайта оқыңыз", "Сенсорлар мен актуаторлар айырмашылығын бекітіңіз", "Практикалық тапсырма №2 мен №3-ті өз бетіңізше орындап көріңіз"];
    } else if (percent < 90) {
        recommendations = ["Жақсы нәтиже! Күрделірек жобаларға көшіңіз", "Line Follower-ге PID контроллер қосуды зерттеңіз", "OpenCV арқылы компьютерлік көру негіздерін бастаңыз"];
    } else {
        recommendations = ["Керемет! Сіз материалды өте жақсы меңгердіңіз", "Енді өз жобаңызды ойлап тауып, оны іске асырыңыз", "Robotics олимпиадасына немесе хакатонға қатысып көріңіз"];
    }

    content.innerHTML = `
        <div class="score-circle score-pop" style="--score-deg: ${scoreDeg}deg">
            <div class="score-inner"><div class="big">${percent}%</div><div style="font-size:0.85rem;color:var(--text-muted)">${correct}/10</div></div>
        </div>
        <div class="analysis-grid">
            <div class="analysis-card reveal-ready revealed"><h4><i class="fas fa-check-circle"></i> Дұрыс жауаптар</h4>
                <p style="font-size:2rem;font-weight:700;color:var(--success)">${correct}</p>
                <p style="color:var(--text-muted);font-size:0.9rem">10 сұрақтан</p></div>
            <div class="analysis-card reveal-ready revealed"><h4><i class="fas fa-times-circle"></i> Қате жауаптар</h4>
                <p style="font-size:2rem;font-weight:700;color:var(--danger)">${10 - correct}</p>
                <p style="color:var(--text-muted);font-size:0.9rem">қайталау қажет</p></div>
        </div>
        <div class="recommendation"><h4><i class="fas fa-lightbulb"></i> Ұсыныстар</h4>
            <ul style="margin:0;padding-left:1.2rem;color:var(--text-muted)">
                ${recommendations.map(r => `<li style="margin-bottom:0.4rem">${r}</li>`).join('')}
            </ul></div>
        ${wrongQuestions.length > 0 ? `
            <div class="analysis-card" style="margin-top:1.5rem"><h4><i class="fas fa-search"></i> Қателерді талдау</h4>
                ${wrongQuestions.map(w => `<div style="margin-bottom:1rem;font-size:0.9rem">
                    <strong>Сұрақ ${w.num}:</strong> ${w.question}<br>
                    <span style="color:var(--danger)">✗ ${w.yourAnswer}</span> → <span style="color:var(--success)">✓ ${w.correctAnswer}</span>
                </div>`).join('')}</div>` : `
            <div class="recommendation" style="margin-top:1.5rem;background:rgba(0,229,255,0.08);border-color:rgba(0,229,255,0.3)">
                <h4 style="color:var(--primary)"><i class="fas fa-trophy"></i> Барлық жауап дұрыс!</h4>
                <p style="color:var(--text-muted);margin:0">Сіз білім беру робототехникасының негіздерін толық меңгердіңіз!</p></div>`}
        <div style="text-align:center;margin-top:2rem">
            <button class="btn btn-primary" onclick="navigateTo('quiz'); retryQuiz();"><i class="fas fa-redo"></i> Тестті қайта тапсыру</button>
        </div>`;
}

renderQuestion();

/* ========== 14. CONFETTI ========== */
function launchConfetti(count = 80) {
    const colors = ['#00e5ff', '#ff00aa', '#7c4dff', '#00e676', '#ffab00'];
    for (let i = 0; i < count; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDelay = Math.random() * 2 + 's';
        conf.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        conf.style.width = (6 + Math.random() * 8) + 'px';
        conf.style.height = (6 + Math.random() * 8) + 'px';
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 5000);
    }
}

/* ========== 15. AI ASSISTANT ========== */
const knowledgeBase = [
    { keywords: ['python', 'пайтон', 'питон'], answer: `Python — робототехникада ең танымал бағдарламалау тілдерінің бірі. Оның артықшылықтары:<br>• Қарапайым және оқылатын синтаксис<br>• Бай кітапханалар (gpiozero, pyfirmata, opencv)<br>• Arduino, Raspberry Pi, micro:bit-пен жұмыс істейді<br>• Бастауыштан кәсіби деңгейге дейін қолданылады<br><br>Мысал: <code>from gpiozero import Robot</code>` },
    { keywords: ['arduino', 'ардуино'], answer: `Arduino — бастауыш робототехника үшін ең танымал микроконтроллер платформасы.<br>• ATmega чипі негізінде<br>• C++ ұқсас тілде бағдарламаланады<br>• Python арқылы да басқаруға болады (pyFirmata)<br>• Көптеген сенсорлар мен модульдер қолдау көрсетеді` },
    { keywords: ['сенсор', 'sensor', 'hc-sr04', 'ультра'], answer: `Робототехникада негізгі сенсорлар:<br>• <strong>Ультрадыбыстық (HC-SR04)</strong> — қашықтықты өлшейді<br>• <strong>IR сенсор</strong> — сызық бойымен жүру<br>• <strong>Түс сенсоры</strong> — заттың түсін анықтау<br>• <strong>Гироскоп/Акселерометр</strong> — ориентация` },
    { keywords: ['line follower', 'сызық', 'лайн'], answer: `Line Follower — классикалық білім беру жобасы.<br>1. 2–3 IR сенсор шассидің астына орнатылады<br>2. Қара сызық жарықты жұтады → сенсор «1»<br>3. Ақ бет жарықты шағылыстырады → «0»<br>4. Логика: сол сенсор қараны көрсе — солға бұрыл<br><br>Практика бөлімінде толық Python коды бар!` },
    { keywords: ['мотор', 'actuator', 'актуатор', 'серво'], answer: `Актуаторлар — роботтың қозғалысын қамтамасыз етеді:<br>• <strong>DC мотор</strong> — үздіксіз айналу<br>• <strong>Серво мотор</strong> — белгілі бір бұрышқа бұрылу (0–180°)<br>• <strong>Степпер мотор</strong> — дәл қадамдық қозғалыс` },
    { keywords: ['stem', 'стем'], answer: `STEM = Science + Technology + Engineering + Mathematics.<br>Білім беру робототехникасы STEM-ді бір жобада біріктіреді.` },
    { keywords: ['raspberry', 'распберри', 'pi'], answer: `Raspberry Pi — толыққанды шағын компьютер (Linux).<br>• Python, C++, Java кез келген тіл<br>• Камера + OpenCV → компьютерлік көру<br>• Wi-Fi, Bluetooth, GPIO` },
    { keywords: ['жоба', 'project', 'pbl'], answer: `Жобалық оқыту (PBL) — ең тиімді әдіс.<br>Мысал жобалар: кедергіні айналып өту, сызық бойымен жүру, Bluetooth басқару, maze solver.` },
    { keywords: ['сәлем', 'салем', 'привет', 'hello', 'hi', 'қалай'], answer: `Сәлем! 👋 Мен RoboMentor — білім беру робототехникасы бойынша көмекшімін. Маған Python, Arduino, сенсорлар немесе жобалар туралы сұраңыз!` }
];

const defaultAnswer = `Қызықты сұрақ! Мен мына тақырыптар бойынша жақсы жауап бере аламын:<br>• Python және робототехника<br>• Arduino / Raspberry Pi<br>• Сенсорлар (ультрадыбыстық, IR)<br>• Моторлар мен актуаторлар<br>• Line Follower жобасы<br>• STEM және жобалық оқыту`;

function getBotResponse(text) {
    const lower = text.toLowerCase();
    for (const item of knowledgeBase) {
        if (item.keywords.some(kw => lower.includes(kw))) return item.answer;
    }
    return defaultAnswer;
}

function addMessage(text, isUser = false) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user' : 'bot'}`;
    msg.innerHTML = `<div class="msg-avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
        <div class="msg-content">${text}</div>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    // Entrance animation already in CSS
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'message bot';
    typing.id = 'typingIndicator';
    typing.innerHTML = `<div class="msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="msg-content"><div class="typing"><span></span><span></span><span></span></div></div>`;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, true);
    input.value = '';
    showTyping();
    setTimeout(() => {
        hideTyping();
        addMessage(getBotResponse(text));
    }, 700 + Math.random() * 800);
}

function askQuick(text) {
    document.getElementById('chatInput').value = text;
    sendMessage();
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

/* ========== 16. FLOATING SHAPES (ambient) ========== */
function createFloatingShapes() {
    const container = document.createElement('div');
    container.className = 'floating-shapes';
    document.body.appendChild(container);

    for (let i = 0; i < 8; i++) {
        const shape = document.createElement('div');
        shape.className = 'float-shape';
        const size = 40 + Math.random() * 80;
        shape.style.width = size + 'px';
        shape.style.height = size + 'px';
        shape.style.left = Math.random() * 100 + 'vw';
        shape.style.top = Math.random() * 100 + 'vh';
        shape.style.animationDuration = (15 + Math.random() * 20) + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';
        shape.style.opacity = 0.03 + Math.random() * 0.05;
        if (Math.random() > 0.5) shape.style.borderRadius = '50%';
        container.appendChild(shape);
    }
}
createFloatingShapes();

/* ========== 17. ROBOT INTERACTION ========== */
const robotEl = document.querySelector('.robot');
if (robotEl) {
    robotEl.addEventListener('mouseenter', () => {
        robotEl.classList.add('robot-excited');
    });
    robotEl.addEventListener('mouseleave', () => {
        robotEl.classList.remove('robot-excited');
    });
}

/* ========== 18. STAR FIELD ========== */
function createStars() {
    const field = document.getElementById('starField');
    if (!field) return;
    const count = Math.min(120, Math.floor(window.innerWidth / 10));
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.5 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
        star.style.animationDelay = Math.random() * 5 + 's';
        if (Math.random() > 0.85) {
            star.style.boxShadow = '0 0 6px 1px rgba(0,229,255,0.8)';
            star.style.background = '#00e5ff';
        }
        field.appendChild(star);
    }
}
createStars();

/* ========== 19. PARALLAX 3D ON MOUSE ========== */
document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    const grid = document.querySelector('.grid-floor');
    if (grid) {
        grid.style.transform = `rotateX(${65 + cy * 3}deg) translateZ(-80px) translateX(${cx * 15}px)`;
    }

    document.querySelectorAll('.floating-poly').forEach((poly, i) => {
        const factor = (i + 1) * 5;
        poly.style.marginLeft = (cx * factor) + 'px';
        poly.style.marginTop = (cy * factor) + 'px';
    });

    const robot = document.querySelector('.robot-container');
    if (robot) {
        robot.style.transform = `rotateY(${cx * 14}deg) rotateX(${-cy * 10}deg)`;
    }
});

console.log('%c EduRobotKZ ', 'background:#00e5ff;color:#000;font-weight:bold;padding:6px 12px;border-radius:6px;font-size:14px');
console.log('%c 3D Sci-Fi Engine + Gradient Titles loaded ✓', 'color:#00e676');
