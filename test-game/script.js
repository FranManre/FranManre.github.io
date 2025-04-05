document.addEventListener("DOMContentLoaded", () => {
    // ============== VARIABLES GLOBALES ==============
    let currentCategory = null;
    let currentTest = null;
    let currentAttempts = [];
    let currentExam = [];
    let currentIndex = 0;
    let userAnswers = [];
    let timer = null;

    // ============== ELEMENTOS DEL DOM ==============
    const sections = {
        examList: document.getElementById("exam-list"),
        testList: document.getElementById("test-list"),
        attemptsList: document.getElementById("attempts-list"),
        quizContainer: document.getElementById("quiz-container"),
        reviewContainer: document.getElementById("review-container")
    };

    const dialogs = {
        exit: document.getElementById("exit-dialog")
    };

    // ============== FUNCIONES PRINCIPALES ==============
    const toggleSection = (sectionToShow) => {
        Object.values(sections).forEach(section => {
            section.classList.toggle("hidden", section !== sectionToShow);
        });
    };

    const loadCategories = async () => {
        // Simulación de carga de categorías desde API
        const categories = ["Matemáticas", "Historia", "Ciencia"];
        const categoryButtonsDiv = document.getElementById("category-buttons");
        categoryButtonsDiv.innerHTML = "";

        categories.forEach(category => {
            const button = document.createElement("button");
            button.textContent = category;
            button.addEventListener("click", () => {
                currentCategory = category;
                document.getElementById("category-title").textContent = category;
                toggleSection(sections.testList);
                loadTestsForCategory(category);
            });
            categoryButtonsDiv.appendChild(button);
        });
    };

    const loadTestsForCategory = async (category) => {
        // Simulación de carga de tests
        const tests = ["Examen Básico", "Examen Avanzado"];
        const testButtonsDiv = document.getElementById("test-buttons");
        testButtonsDiv.innerHTML = "";

        tests.forEach(test => {
            const button = document.createElement("button");
            button.textContent = test;
            button.addEventListener("click", () => {
                currentTest = test;
                document.getElementById("test-title").textContent = test;
                toggleSection(sections.attemptsList);
                loadAttemptsForTest(test);
            });
            testButtonsDiv.appendChild(button);
        });
    };

    const loadAttemptsForTest = async (test) => {
        // Simulación de carga de intentos anteriores
        currentAttempts = [
            { id: 1, date: "2023-10-01", score: "8/10" },
            { id: 2, date: "2023-10-05", score: "6/10" }
        ];

        const attemptsButtonsDiv = document.getElementById("attempts-buttons");
        attemptsButtonsDiv.innerHTML = "";

        currentAttempts.forEach(attempt => {
            const button = document.createElement("button");
            button.textContent = `Intento ${attempt.id} - ${attempt.date} - ${attempt.score}`;
            button.addEventListener("click", () => {
                loadAttemptReview(attempt.id);
            });
            attemptsButtonsDiv.appendChild(button);
        });
    };

    const startNewAttempt = async () => {
        // Cargar examen desde API
        currentExam = [
            {
                question: "¿Cuál es la capital de Francia?",
                options: { a: "Madrid", b: "París", c: "Roma" },
                solution: "b"
            },
            // ... más preguntas
        ];
        userAnswers = [];
        currentIndex = 0;
        toggleSection(sections.quizContainer);
        document.getElementById("quiz-title").textContent = currentTest;
        showQuestion();
    };

    const showQuestion = () => {
        const question = currentExam[currentIndex];
        document.getElementById("question-text").textContent = question.question;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        Object.entries(question.options).forEach(([key, value]) => {
            const button = document.createElement("button");
            button.textContent = `${key.toUpperCase()}: ${value}`;
            button.addEventListener("click", () => {
                userAnswers[currentIndex] = key;
                document.getElementById("next-question").disabled = false;
            });
            optionsDiv.appendChild(button);
        });

        document.getElementById("next-question").disabled = true;
    };

    const loadAttemptReview = (attemptId) => {
        toggleSection(sections.reviewContainer);
        const reviewContent = document.getElementById("review-content");
        reviewContent.innerHTML = "";

        currentExam.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("question-review");
            
            // Mostrar pregunta
            questionDiv.innerHTML = `
                <h3>Pregunta ${index + 1}</h3>
                <p>${question.question}</p>
                <div class="options-review"></div>
            `;

            // Mostrar opciones con estilos
            const optionsDiv = questionDiv.querySelector(".options-review");
            Object.entries(question.options).forEach(([key, value]) => {
                const option = document.createElement("div");
                option.classList.add("option-review");
                if (key === userAnswers[index]) option.classList.add("user-answer");
                if (key === question.solution) option.classList.add("correct-answer");
                option.textContent = `${key.toUpperCase()}: ${value}`;
                optionsDiv.appendChild(option);
            });

            reviewContent.appendChild(questionDiv);
        });
    };

    // ============== MANEJO DE NAVEGACIÓN ==============
    document.getElementById("back-to-categories").addEventListener("click", () => {
        toggleSection(sections.examList);
    });

    document.getElementById("back-to-tests").addEventListener("click", () => {
        toggleSection(sections.testList);
    });

    document.getElementById("back-to-attempts").addEventListener("click", () => {
        toggleSection(sections.attemptsList);
    });

    document.getElementById("retry-test").addEventListener("click", startNewAttempt);

    document.getElementById("next-question").addEventListener("click", () => {
        currentIndex++;
        if (currentIndex < currentExam.length) {
            showQuestion();
        } else {
            saveAttempt();
            toggleSection(sections.attemptsList);
        }
    });

    // ============== DIÁLOGOS Y CONFIRMACIONES ==============
    document.getElementById("exit-quiz").addEventListener("click", () => {
        dialogs.exit.showModal();
    });

    document.getElementById("confirm-exit").addEventListener("click", () => {
        dialogs.exit.close();
        toggleSection(sections.attemptsList);
    });

    document.getElementById("cancel-exit").addEventListener("click", () => {
        dialogs.exit.close();
    });

    // ============== INICIALIZACIÓN ==============
    loadCategories();
});
