document.addEventListener("DOMContentLoaded", () => {
    loadExamList(); // Cargar automáticamente la lista de exámenes cuando se carga la página

    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");

    if (examFile) {
        // Si hay un parámetro 'exam' en la URL, cargar el examen correspondiente
        loadExam(examFile);
    }
});

// Cargar la lista de exámenes
function loadExamList() {
    fetch('https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/')
        .then(response => response.json())
        .then(exams => {
            const examListDiv = document.getElementById("exam-buttons");
            examListDiv.innerHTML = "";
            exams.forEach(exam => {
                const button = document.createElement("button");
                button.textContent = exam.replace(/_/g, " ");
                button.onclick = () => {
                    window.location.href = `?exam=${exam}`;
                };
                examListDiv.appendChild(button);
            });
        })
        .catch(error => {
            console.error("Error cargando la lista de exámenes:", error);
        });
}

// Cargar un examen
function loadExam(examFile) {
    fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examFile}`)
        .then(response => response.json())
        .then(exam => {
            document.getElementById("exam-title").textContent = examFile.replace(/_/g, " ").replace(".json", "");
            startExam(exam);
        })
        .catch(error => {
            console.error("Error cargando el examen:", error);
        });
}

let currentExam = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;

// Iniciar el examen
function startExam(exam) {
    currentExam = exam;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("exam-list").classList.add("hidden");
    showQuestion();
}

// Mostrar la pregunta actual
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

// Verificar la respuesta
function checkAnswer(selected, correct) {
    if (selected === correct) correctAnswers++;

    currentQuestionIndex++;
    if (currentQuestionIndex < currentExam.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Mostrar los resultados
function showResults() {
    const percentage = (correctAnswers / currentExam.questions.length) * 100;
    document.getElementById("results").innerHTML = `
        <h2>Resultados</h2>
        <p>Acertadas: ${correctAnswers}/${currentExam.questions.length} (${percentage.toFixed(2)}%)</p>
    `;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
}
