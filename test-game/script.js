document.getElementById("load-exams").addEventListener("click", loadExamList);

function loadExamList() {
    fetch("exams/exams.json") // Lista con los nombres de los exámenes
        .then(response => response.json())
        .then(data => {
            const examListDiv = document.getElementById("exam-list");
            examListDiv.innerHTML = "";
            data.forEach(exam => {
                const button = document.createElement("button");
                button.textContent = exam.replace(/_/g, " ");
                button.onclick = () => loadExam(exam);
                examListDiv.appendChild(button);
            });
        });
}

let currentExam = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;

function loadExam(examName) {
    fetch(`exams/${examName}.json`)
        .then(response => response.json())
        .then(exam => {
            currentExam = exam;
            currentQuestionIndex = 0;
            correctAnswers = 0;
            document.getElementById("exam-title").textContent = exam.title;
            document.getElementById("exam-list").classList.add("hidden");
            document.getElementById("quiz-container").classList.remove("hidden");
            showQuestion();
        });
}

function showQuestion() {
    const questionObj = currentExam.questions[currentQuestionIndex];
    document.getElementById("question-text").textContent = questionObj.question;
    
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    
    Object.entries(questionObj.options).forEach(([key, text]) => {
        const btn = document.createElement("button");
        btn.textContent = `${key.toUpperCase()}: ${text}`;
        btn.onclick = () => checkAnswer(key, questionObj.solution);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    if (selected === correct) correctAnswers++;
    
    currentQuestionIndex++;
    if (currentQuestionIndex < currentExam.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const percentage = (correctAnswers / currentExam.questions.length) * 100;
    document.getElementById("results").innerHTML = `
        <h2>Resultados</h2>
        <p>Acertadas: ${correctAnswers}/${currentExam.questions.length} (${percentage.toFixed(2)}%)</p>
    `;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
}
