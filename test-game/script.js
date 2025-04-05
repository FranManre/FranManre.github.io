document.addEventListener("DOMContentLoaded", () => {
    // ============== VARIABLES GLOBALES ==============
    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");
    let currentExam = [];
    let currentIndex = 0;
    let correctAnswers = 0;
    let timer = null;

    // ============== ELEMENTOS DEL DOM ==============
    const examList = document.getElementById("exam-list");
    const quizContainer = document.getElementById("quiz-container");
    const resultsContainer = document.getElementById("results");
    const categorySelect = document.getElementById("category-select");
    const examButtonsDiv = document.getElementById("exam-buttons");
    const loader = document.getElementById("loader");

    // ============== FUNCIONES PRINCIPALES ==============
    const toggleLoader = (show = true) => {
        loader.style.display = show ? "block" : "none";
    };

    const toggleSection = (section, show = true) => {
        section.classList.toggle("hidden", !show);
        section.classList.toggle("visible", show);
    };

    const formatText = (str) => {
        return str.replace(/_/g, " ").replace(/\.json$/, "");
    };

    // ============== CARGA DE EXÁMENES ==============
    const loadExamList = async () => {
        toggleLoader(true);
        try {
            const response = await fetch("https://api.github.com/repos/FranManre/FranManre.github.io/contents/test-game/exams");
            if (!response.ok) throw new Error("Error de red");
            
            const data = await response.json();
            const categories = {};

            // Procesar archivos JSON
            data.filter(item => item.name.endsWith(".json")).forEach(item => {
                const category = item.name.replace(/_\d+\.json$/, "");
                if (!categories[category]) categories[category] = [];
                categories[category].push(item.name);
            });

            // Llenar selector de categorías
            categorySelect.innerHTML = "<option value='' disabled selected>Elige una categoría</option>";
            Object.keys(categories).forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = formatText(category);
                categorySelect.appendChild(option);
            });

            // Manejar cambio de categoría
            categorySelect.addEventListener("change", () => {
                examButtonsDiv.innerHTML = "";
                categories[categorySelect.value].forEach(fileName => {
                    const button = document.createElement("button");
                    button.textContent = formatText(fileName);
                    button.addEventListener("click", () => {
                        toggleSection(examList, false);
                        toggleSection(quizContainer, true);
                        loadExam(fileName);
                    });
                    examButtonsDiv.appendChild(button);
                });
            });

        } catch (error) {
            console.error("Error:", error);
            alert("Error cargando los exámenes. Intenta recargar la página.");
        } finally {
            toggleLoader(false);
        }
    };

    // ============== CARGAR EXAMEN ESPECÍFICO ==============
    const loadExam = async (examName) => {
        toggleLoader(true);
        try {
            const response = await fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`);
            if (!response.ok) throw new Error("Examen no encontrado");
            
            currentExam = await response.json();
            if (!Array.isArray(currentExam)) throw new Error("Formato de examen inválido");

            document.getElementById("exam-title").textContent = formatText(examName);
            currentIndex = 0;
            correctAnswers = 0;
            showQuestion();
        } catch (error) {
            console.error("Error:", error);
            alert(`Error al cargar el examen: ${error.message}`);
            toggleSection(examList, true);
            toggleSection(quizContainer, false);
        } finally {
            toggleLoader(false);
        }
    };

    // ============== MOSTRAR PREGUNTAS ==============
    const showQuestion = () => {
        const questionObj = currentExam[currentIndex];
        document.getElementById("question-text").textContent = questionObj.question;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        Object.entries(questionObj.options).forEach(([key, text]) => {
            const btn = document.createElement("button");
            btn.textContent = `${key.toUpperCase()}: ${text}`;
            btn.classList.add("option-btn");
            
            btn.addEventListener("click", () => {
                checkAnswer(key === questionObj.solution, btn);
                disableAllOptions();
                showNextButton();
            });
            
            optionsDiv.appendChild(btn);
        });
    };

    // ============== MANEJO DE RESPUESTAS ==============
    const checkAnswer = (isCorrect, clickedBtn) => {
        const correctBtn = [...document.querySelectorAll("#options button")].find(
            btn => btn.textContent.startsWith(currentExam[currentIndex].solution.toUpperCase())
        );

        if (isCorrect) {
            correctAnswers++;
            clickedBtn.classList.add("correct-answer");
        } else {
            clickedBtn.classList.add("incorrect-answer");
            correctBtn.classList.add("correct-answer");
        }
    };

    const disableAllOptions = () => {
        document.querySelectorAll("#options button").forEach(btn => {
            btn.disabled = true;
        });
    };

    const showNextButton = () => {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = currentIndex < currentExam.length - 1 ? "Siguiente" : "Ver resultados";
        nextBtn.id = "next-btn";
        
        nextBtn.addEventListener("click", () => {
            currentIndex++;
            if (currentIndex < currentExam.length) {
                showQuestion();
            } else {
                showResults();
            }
        });
        
        document.getElementById("options").appendChild(nextBtn);
    };

    // ============== MOSTRAR RESULTADOS ==============
    const showResults = () => {
        const percentage = (correctAnswers / currentExam.length) * 100;
        resultsContainer.innerHTML = `
            <h2>Resultados</h2>
            <p>Preguntas correctas: ${correctAnswers}/${currentExam.length}</p>
            <p>Porcentaje de aciertos: ${percentage.toFixed(2)}%</p>
            <button id="restart-btn">Reintentar</button>
            <button id="new-exam">Nuevo examen</button>
        `;
        
        toggleSection(quizContainer, false);
        toggleSection(resultsContainer, true);
        
        document.getElementById("restart-btn").addEventListener("click", () => {
            currentIndex = 0;
            correctAnswers = 0;
            toggleSection(resultsContainer, false);
            toggleSection(quizContainer, true);
            showQuestion();
        });

        document.getElementById("new-exam").addEventListener("click", () => {
            toggleSection(resultsContainer, false);
            toggleSection(examList, true);
        });
    };

    // ============== MANEJO DE NAVEGACIÓN ==============
    document.getElementById("back-to-list").addEventListener("click", () => {
        toggleSection(examList, true);
        toggleSection(quizContainer, false);
    });

    // ============== INICIALIZACIÓN ==============
    examFile ? loadExam(examFile) : loadExamList();
});
