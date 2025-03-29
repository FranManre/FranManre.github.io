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
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");

    if (examFile) {
        loadExam(examFile);  // Si se pasa un examen en la URL, lo cargamos automáticamente.
    } else {
        loadExamList();  // Si no hay examen en la URL, mostramos la lista de exámenes.
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
                    window.location.href = `index.html?exam=${fileName}`;  // Cambia la URL para cargar el examen.
                };
                examButtonsDiv.appendChild(button);
            });
        })
        .catch(error => console.error("Error cargando la lista de exámenes:", error));
}

let currentExam = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;

function loadExam(examName) {
    fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`)
        .then(response => response.json())
        .then(exam => {
            currentExam = exam;
            currentQuestionIndex = 0;
            correctAnswers = 0;
            document.getElementById("exam-title").textContent = examName.replace(/_/g, " ").replace(".json", "");
            document.getElementById("exam-list").classList.add("hidden");
            document.getElementById("quiz-container").classList.remove("hidden");
            showQuestion();
        })
        .catch(error => console.error("Error cargando el examen:", error));
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
