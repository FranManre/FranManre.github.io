document.addEventListener("DOMContentLoaded", () => {
    let currentExam = [];
    let currentIndex = 0;
    let userAnswers = [];
    let attemptsHistory = JSON.parse(localStorage.getItem("attemptsHistory")) || {};

    const examList = document.getElementById("exam-list");
    const quizContainer = document.getElementById("quiz-container");
    const attemptsList = document.getElementById("attempts-list");
    const reviewContainer = document.getElementById("review-container");
    const categorySelect = document.getElementById("category-select");
    const examButtonsDiv = document.getElementById("exam-buttons");
    const attemptsButtonsDiv = document.getElementById("attempts-buttons");
    const exitDialog = document.getElementById("exit-dialog");
    const homeButton = document.getElementById("home-button");

    const toggleSection = (sectionToShow) => {
        [examList, quizContainer, attemptsList, reviewContainer].forEach(section => {
            section.classList.toggle("hidden", section !== sectionToShow);
            homeButton.classList.toggle("hidden", quizContainer == sectionToShow);
        });
    };

    const formatText = (str) => str.replace(/_/g, " ").replace(/\.json$/, "");

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
                categories[categorySelect.value].sort((a, b) => a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                }));

                categories[categorySelect.value].forEach(fileName => {
                    const button = document.createElement("button");
                    button.textContent = formatText(fileName);
                    button.addEventListener("click", () => loadAttemptsList(fileName));
                    examButtonsDiv.appendChild(button);
                });
            });

        } catch (error) {
            console.error("Error cargando exámenes:", error);
            alert("Error cargando exámenes");
        }
    };

    const loadAttemptsList = (examName) => {
        const attempts = attemptsHistory[examName] || [];
        attemptsButtonsDiv.innerHTML = "";

        attempts.slice(-5).reverse().forEach((attempt, index) => {
            const button = document.createElement("button");
            button.textContent = `[${attempt.time} - ${attempt.date}]: ${attempt.score} (${attempt.percentage}%)`;
            button.addEventListener("click", () => loadReview(examName, attempts.length - 1 - index));
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

    const startExam = async (examName) => {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`);
            currentExam = await response.json();
            currentIndex = 0;
            userAnswers = new Array(currentExam.length).fill(null);
            toggleSection(quizContainer);
            document.getElementById("quiz-title").dataset.originalName = examName;
            document.getElementById("quiz-title").textContent = formatText(examName);
            showQuestion();
        } catch (error) {
            console.error("Error cargando examen:", error);
            alert("Error cargando examen");
        }
    };

    const showQuestion = () => {
        const question = currentExam[currentIndex];
        document.getElementById("question-text").textContent = question.question;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        Object.entries(question.options).forEach(([key, text]) => {
            const label = document.createElement("label");
            label.className = `radio-option ${userAnswers[currentIndex] === key ? "selected" : ""}`;
            
            label.innerHTML = `
                <input 
                    type="radio" 
                    name="answer" 
                    value="${key}" 
                    ${userAnswers[currentIndex] === key ? "checked" : ""}
                >
                ${key.toUpperCase()}: ${text}
            `;
            
            label.addEventListener("click", () => {
                userAnswers[currentIndex] = key;
                document.querySelectorAll(".radio-option").forEach(opt => opt.classList.remove("selected"));
                label.classList.add("selected");
            });
            
            optionsDiv.appendChild(label);
        });

        const navButtons = document.getElementById("nav-buttons");
        navButtons.innerHTML = `
            <button id="previous-question">Anterior</button>
            <button id="next-question" class="${currentIndex === currentExam.length - 1 ? "finish-btn" : ""}">
                ${currentIndex === currentExam.length - 1 ? "Finalizar" : "Siguiente"}
            </button>
        `;

        document.getElementById("previous-question").addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                showQuestion();
            }
        });

        document.getElementById("next-question").addEventListener("click", () => {
            if (currentIndex < currentExam.length - 1) {
                currentIndex++;
                showQuestion();
            } else {
                saveAttempt();
                loadAttemptsList(document.getElementById("quiz-title").dataset.originalName);
            }
        });
    };

    const saveAttempt = () => {
        const examName = document.getElementById("quiz-title").dataset.originalName;
        const score = userAnswers.filter((ans, index) => ans === currentExam[index].solution).length;
        const total = currentExam.length;
        const percentage = ((score / total) * 100).toFixed(1);
        const now = new Date();

        const attempt = {
            score: `${score}/${total}`,
            percentage: percentage,
            date: now.toLocaleDateString("es-ES"),
            time: now.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' }),
            answers: [...userAnswers]
        };

        attemptsHistory[examName] = attemptsHistory[examName] || [];
        attemptsHistory[examName].push(attempt);

        if (attemptsHistory[examName].length > 5) {
            attemptsHistory[examName].shift();
        }

        localStorage.setItem("attemptsHistory", JSON.stringify(attemptsHistory));
    };

    const loadReview = async (examName, attemptIndex) => {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`);
            currentExam = await response.json();
            const attempt = attemptsHistory[examName][attemptIndex];
            const reviewContent = document.getElementById("review-content");
            reviewContent.innerHTML = "";
            
            const [correctAnswers, totalQuestions] = attempt.score.split('/');
            const reviewStats = document.getElementById("review-stats");
            reviewStats.innerHTML = `[${attempt.time} - ${attempt.date}]: ${attempt.score} (${attempt.percentage}%)`;

            currentExam.forEach((question, index) => {
                const questionDiv = document.createElement("div");
                questionDiv.classList.add("review-question");
            
                questionDiv.innerHTML = `
                    <h3>Pregunta ${index + 1}</h3>
                    <p>${question.question}</p>
                    <div class="options-review"></div>
                `;

                const optionsDiv = questionDiv.querySelector(".options-review");
                Object.entries(question.options).forEach(([key, text]) => {
                    const option = document.createElement("div");
                    option.classList.add("option-review");
                
                    if (key === attempt.answers[index]) {
                        option.classList.add(key === question.solution ? "correct-answer" : "incorrect-answer");
                    }
                
                    if (key === question.solution && key !== attempt.answers[index]) {
                        option.classList.add("correct-answer");
                    }

                    option.textContent = `${key.toUpperCase()}: ${text}`;
                    optionsDiv.appendChild(option);
                });

                reviewContent.appendChild(questionDiv);
            });

            toggleSection(reviewContainer);
        } catch (error) {
            console.error("Error cargando revisión:", error);
            alert("Error al cargar la revisión");
        }
    };


    document.getElementById("exit-quiz").addEventListener("click", () => exitDialog.showModal());
    document.getElementById("confirm-exit").addEventListener("click", () => {
        exitDialog.close();
        toggleSection(attemptsList);
    });
    document.getElementById("cancel-exit").addEventListener("click", () => exitDialog.close());
    document.getElementById("back-to-attempts").addEventListener("click", () => toggleSection(attemptsList));
    document.getElementById("back-to-tests").addEventListener("click", () => toggleSection(examList));
    
    loadExamList();
});
