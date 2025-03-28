document.addEventListener("DOMContentLoaded", () => { const urlParams = new URLSearchParams(window.location.search); const examFile = urlParams.get("exam");

if (!examFile) return;

fetch(`exams/${examFile}`)
    .then(response => response.json())
    .then(exam => {
        document.getElementById("exam-title").textContent = examFile.replace(/_/g, " ").replace(".json", "");
        startExam(exam);
    })
    .catch(error => console.error("Error cargando el examen:", error));

});

let currentExam = null; let currentQuestionIndex = 0; let correctAnswers = 0;

function startExam(exam) { currentExam = exam; currentQuestionIndex = 0; correctAnswers = 0; document.getElementById("quiz-container").classList.remove("hidden"); showQuestion(); }

function showQuestion() { const questionObj = currentExam.questions[currentQuestionIndex]; document.getElementById("question-text").textContent = questionObj.question;

const optionsDiv = document.getElementById("options");
optionsDiv.innerHTML = "";

Object.entries(questionObj.options).forEach(([key, text]) => {
    const btn = document.createElement("button");
    btn.textContent = `${key.toUpperCase()}: ${text}`;
    btn.onclick = () => checkAnswer(key, questionObj.solution);
    optionsDiv.appendChild(btn);
});

}

function checkAnswer(selected, correct) { if (selected === correct) correctAnswers++;

currentQuestionIndex++;
if (currentQuestionIndex < currentExam.questions.length) {
    showQuestion();
} else {
    showResults();
}

}

function showResults() { const percentage = (correctAnswers / currentExam.questions.length) * 100; document.getElementById("results").innerHTML = <h2>Resultados</h2> <p>Acertadas: ${correctAnswers}/${currentExam.questions.length} (${percentage.toFixed(2)}%)</p>; document.getElementById("quiz-container").classList.add("hidden"); document.getElementById("results").classList.remove("hidden"); }

