document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");

    if (examFile) {
        loadExam(examFile);
    } else {
        loadExamList();
        loadHistory();
    }
});

function loadExamList() {
    fetch("https://api.github.com/repos/FranManre/FranManre.github.io/contents/test-game/exams")
        .then(response => response.json())
        .then(data => {
            const examButtonsDiv = document.getElementById("exam-buttons");
            examButtonsDiv.innerHTML = "";

            data.forEach(item => {
                const fileName = item.name;
                const button = document.createElement("button");
                button.textContent = fileName.replace(/_/g, " ").replace(".json", "");
                button.onclick = () => {
                    window.location.href = `index.html?exam=${fileName}`;
                };
                examButtonsDiv.appendChild(button);
            });
        })
        .catch(error => console.error("Error cargando la lista de exámenes:", error));
}

let currentExam = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let userAnswers = [];

function loadExam(examName) {
    fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`)
        .then(response => response.json())
        .then(exam => {
            currentExam = exam;
            currentQuestionIndex = 0;
            correctAnswers = 0;
            userAnswers = [];
            document.getElementById("exam-title").textContent = examName.replace(/_/g, " ").replace(".json", "");
            document.getElementById("exam-list").classList.add("hidden");
            document.getElementById("quiz-container").classList.remove("hidden");
            showQuestion();
        })
        .catch(error => console.error("Error cargando el examen:", error));
}

function showQuestion() {
    const questionObj = currentExam[currentQuestionIndex];
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
    userAnswers.push({ question: currentExam[currentQuestionIndex].question, selected, correct });
    if (selected === correct) correctAnswers++;

    currentQuestionIndex++;
    if (currentQuestionIndex < currentExam.length) {
        showQuestion();
    } else {
        saveHistory();
        showResults();
    }
}

function showResults() {
    const percentage = (correctAnswers / currentExam.length) * 100;
    document.getElementById("score").textContent = `Acertadas: ${correctAnswers}/${currentExam.length} (${percentage.toFixed(2)}%)`;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");

    document.getElementById("review-btn").onclick = showReview;
}

function showReview() {
    const reviewSection = document.getElementById("review-section");
    reviewSection.innerHTML = "<h3>Revisión del Examen</h3>";

    userAnswers.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${item.question}</p>
                         <p>Tu respuesta: ${item.selected.toUpperCase()} (${item.selected === item.correct ? "✅" : "❌"})</p>
                         <p>Respuesta correcta: ${item.correct.toUpperCase()}</p><hr>`;
        reviewSection.appendChild(div);
    });

    reviewSection.classList.remove("hidden");
}

function saveHistory() {
    const history = JSON.parse(localStorage.getItem("examHistory") || "[]");
    const newEntry = { date: new Date().toLocaleString(), score: `${correctAnswers}/${currentExam.length}` };
    history.push(newEntry);
    localStorage.setItem("examHistory", JSON.stringify(history));
}

function loadHistory() {
    const historyDiv = document.getElementById("history");
    const history = JSON.parse(localStorage.getItem("examHistory") || "[]");

    if (history.length === 0) {
        historyDiv.innerHTML = "<p>No hay intentos previos.</p>";
    } else {
        historyDiv.innerHTML = "<h3>Historial de Intentos</h3>";
        history.forEach(entry => {
            historyDiv.innerHTML += `<p>${entry.date}: ${entry.score}</p>`;
        });
    }
}
