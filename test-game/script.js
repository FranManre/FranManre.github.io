document.addEventListener("DOMContentLoaded", () => {
    // ============== VARIABLES GLOBALES ==============
    let currentExam = [];
    let currentIndex = 0;
    let userAnswers = [];
    let attemptsHistory = JSON.parse(localStorage.getItem("attemptsHistory")) || {};

    // ============== ELEMENTOS DEL DOM ==============
    const examList = document.getElementById("exam-list");
    const quizContainer = document.getElementById("quiz-container");
    const attemptsList = document.getElementById("attempts-list");
    const reviewContainer = document.getElementById("review-container");
    const categorySelect = document.getElementById("category-select");
    const examButtonsDiv = document.getElementById("exam-buttons");
    const attemptsButtonsDiv = document.getElementById("attempts-buttons");
    const exitDialog = document.getElementById("exit-dialog");

    // ============== FUNCIONES PRINCIPALES ==============
    const toggleSection = (sectionToShow) => {
        [examList, quizContainer, attemptsList, reviewContainer]
            .filter(section => section !== null)
            .forEach(section => {
                const isVisible = section === sectionToShow;
                section.classList.toggle("hidden", !isVisible);
                section.classList.toggle("visible", isVisible);
            });
    };

    const formatText = (str) => str.replace(/_/g, " ").replace(/\.json$/, "");

    // ============== CARGA DE EXÁMENES ==============
    const loadExamList = async () => {
        try {
            const response = await fetch("https://api.github.com/repos/FranManre/FranManre.github.io/contents/test-game/exams");
            const data = await response.json();
            const categories = {};

            data.filter(item => item.name.endsWith(".json")).forEach(item => {
                const category = item.name.replace(/_\d+\.json$/, "");
                categories[category] = categories[category] || [];
                categories[category].push(item.name);
            });

            categorySelect.innerHTML = `<option value="" disabled selected>Elige categoría</option>`;
            Object.keys(categories).forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = formatText(category);
                categorySelect.appendChild(option);
            });

            categorySelect.addEventListener("change", () => {
                examButtonsDiv.innerHTML = "";
                categories[categorySelect.value].forEach(fileName => {
                    const button = document.createElement("button");
                    button.textContent = formatText(fileName);
                    button.addEventListener("click", () => loadAttemptsList(fileName));
                    examButtonsDiv.appendChild(button);
                });
            });

        } catch (error) {
            console.error("Error:", error);
            alert("Error cargando exámenes");
        }
    };

    // ============== GESTIÓN DE INTENTOS Y REVISIÓN ============
    const loadAttemptsList = (examName) => {
        const attempts = attemptsHistory[examName] || [];
        attemptsButtonsDiv.innerHTML = "";

        attempts.forEach((attempt, index) => {
            const button = document.createElement("button");
            button.textContent = `${attempt.score} ${attempt.percentage}% ${attempt.time} ${attempt.date}`;
            button.addEventListener("click", () => loadReview(examName, index));
            attemptsButtonsDiv.appendChild(button);
        });

        const newAttemptBtn = document.createElement("button");
        newAttemptBtn.textContent = "Nuevo intento";
        newAttemptBtn.classList.add("primary");
        newAttemptBtn.addEventListener("click", () => startExam(examName));
        attemptsButtonsDiv.appendChild(newAttemptBtn);

        toggleSection(attemptsList);
        document.getElementById("test-title").textContent = formatText(examName);
    };

    // Revisión detallada
    const loadReview = (examName, attemptIndex) => {
        const attempt = attemptsHistory[examName][attemptIndex];
        const reviewContent = document.getElementById("review-content");
        reviewContent.innerHTML = "";

        currentExam.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("question-review");

            questionDiv.innerHTML += `
                <h3>Pregunta ${index + 1}</h3>
                <p>${question.question}</p>
                <div class="options-review"></div>
            `;

            const optionsDiv = questionDiv.querySelector(".options-review");
            Object.entries(question.options).forEach(([key, text]) => {
                const optionDiv = document.createElement("div");
                optionDiv.classList.add(
                    "option-review",
                    key === attempt.answers[index] ? "user-answer" : "",
                    key === question.solution ? "correct-answer" : ""
                );
                optionDiv.textContent += `${key.toUpperCase()}: ${text}`;
                optionsDiv.appendChild(optionDiv);
            });

            reviewContent.appendChild(questionDiv);
        });

        toggleSection(reviewContainer);
    };

    // Guardar intento
    const saveAttemptAndNavigateBackToAttempts=()=>{
        
toggleSection(attemptContainer)
}
