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

    // ============== GESTIÓN DE INTENTOS ==============
    const loadAttemptsList = (examName) => {
        const attempts = attemptsHistory[examName] || [];
        attemptsButtonsDiv.innerHTML = "";

        attempts.forEach((attempt, index) => {
            const button = document.createElement("button");
            button.textContent = `Intento ${index + 1} - ${attempt.date} - ${attempt.score}`;
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

    // ============== INICIAR EXAMEN ==============
    const startExam = async (examName) => {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`);
            currentExam = await response.json();
            currentIndex = 0;
            userAnswers = new Array(currentExam.length).fill(null);
            toggleSection(quizContainer);
            showQuestion();
        } catch (error) {
            console.error("Error:", error);
            alert("Error cargando examen");
        }
    };

    // ============== MOSTRAR PREGUNTAS ==============
    const showQuestion = () => {
        const question = currentExam[currentIndex];
        document.getElementById("question-text").textContent = question.question;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        Object.entries(question.options).forEach(([key, text]) => {
            const button = document.createElement("button");
            button.textContent = `${key.toUpperCase()}: ${text}`;
            button.classList.toggle("selected", key === userAnswers[currentIndex]);
            button.addEventListener("click", () => {
                userAnswers[currentIndex] = key;
                showQuestion();
            });
            optionsDiv.appendChild(button);
        });

        document.getElementById("next-question").disabled = false;
    };

    // ============== NAVEGACIÓN EN EXAMEN ==============
    document.getElementById("next-question").addEventListener("click", () => {
        currentIndex++;
        if (currentIndex < currentExam.length) {
            showQuestion();
        } else {
            saveAttempt();
            toggleSection(attemptsList);
        }
    });

    // ============== GUARDAR INTENTO ==============
    const saveAttempt = () => {
        const examName = categorySelect.value;
        const score = calculateScore();
        const attempt = {
            date: new Date().toLocaleString(),
            score: `${score}/${currentExam.length}`,
            answers: [...userAnswers]
        };

        attemptsHistory[examName] = attemptsHistory[examName] || [];
        attemptsHistory[examName].push(attempt);
        localStorage.setItem("attemptsHistory", JSON.stringify(attemptsHistory));
    };

    const calculateScore = () => {
        return currentExam.reduce((acc, question, index) => {
            return acc + (userAnswers[index] === question.solution ? 1 : 0);
        }, 0);
    };

    // ============== REVISIÓN DE INTENTOS ==============
    const loadReview = (examName, attemptIndex) => {
        const attempt = attemptsHistory[examName][attemptIndex];
        const reviewContent = document.getElementById("review-content");
        reviewContent.innerHTML = "";

        currentExam.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("question-review");
            
            questionDiv.innerHTML = `
                <h3>Pregunta ${index + 1}</h3>
                <p>${question.question}</p>
                <div class="options-review"></div>
            `;

            const optionsDiv = questionDiv.querySelector(".options-review");
            Object.entries(question.options).forEach(([key, text]) => {
                const option = document.createElement("div");
                option.classList.add("option-review");
                if (key === attempt.answers[index]) option.classList.add("user-answer");
                if (key === question.solution) option.classList.add("correct-answer");
                option.textContent = `${key.toUpperCase()}: ${text}`;
                optionsDiv.appendChild(option);
            });

            reviewContent.appendChild(questionDiv);
        });

        toggleSection(reviewContainer);
    };

    // ============== MANEJO DE DIÁLOGOS ==============
    document.getElementById("exit-quiz").addEventListener("click", () => {
        exitDialog.showModal();
    });

    document.getElementById("confirm-exit").addEventListener("click", () => {
        exitDialog.close();
        toggleSection(attemptsList);
    });

    document.getElementById("cancel-exit").addEventListener("click", () => {
        exitDialog.close();
    });

    // ============== INICIALIZACIÓN ==============
    loadExamList();
});
