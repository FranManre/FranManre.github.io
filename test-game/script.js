document.addEventListener("DOMContentLoaded", () => {
    // Cargar la lista de exámenes al inicio
    loadExamList(); 

    // Obtener el parámetro 'exam' de la URL (ya debería estar funcionando bien)
    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");

    if (examFile) {
        // Si se pasa un parámetro 'exam' en la URL, cargar el examen correspondiente
        loadExam(examFile);
    }
});

// Función para cargar la lista de exámenes (sin cambios)
function loadExamList() {
    fetch('https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/examList.json')
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

// Función para cargar un examen en base al nombre del archivo JSON
function loadExam(examFile) {
    // Asegurémonos de que la URL esté bien formada y apunte al archivo correcto
    const examUrl = `https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examFile}`;

    fetch(examUrl)
        .then(response => {
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`No se pudo cargar el examen: ${response.statusText}`);
            }
            return response.json();
        })
        .then(exam => {
            // Asegurarnos de que el archivo JSON contiene los datos correctos
            if (exam && exam.questions) {
                document.getElementById("exam-title").textContent = examFile.replace(/_/g, " ").replace(".json", "");
                startExam(exam);
            } else {
                throw new Error("El archivo JSON no tiene el formato correcto");
            }
        })
        .catch(error => {
            console.error("Error cargando el examen:", error);
        });
}

let currentExam = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;

// Función para iniciar el examen
function startExam(exam) {
    currentExam = exam;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("exam-list").classList.add("hidden");
    showQuestion();
}

// Función para mostrar la pregunta actual
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

// Función para verificar la respuesta
function checkAnswer(selected, correct) {
    if (selected === correct) correctAnswers++;

    currentQuestionIndex++;
    if (currentQuestionIndex < currentExam.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Función para mostrar los resultados
function showResults() {
    const percentage = (correctAnswers / currentExam.questions.length) * 100;
    document.getElementById("results").innerHTML = `
        <h2>Resultados</h2>
        <p>Acertadas: ${correctAnswers}/${currentExam.questions.length} (${percentage.toFixed(2)}%)</p>
    `;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
}
