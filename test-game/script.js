document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examFile = urlParams.get("exam");

    if (examFile) {
        loadExam(examFile);
    } else {
        loadExamList();
    }

    document.getElementById("back-to-list").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});

function loadExamList() {
    fetch("https://api.github.com/repos/FranManre/FranManre.github.io/contents/test-game/exams")
        .then(response => response.json())
        .then(data => {
            const examButtonsDiv = document.getElementById("exam-buttons");
            const categorySelect = document.getElementById("category-select");
            examButtonsDiv.innerHTML = "";
            categorySelect.innerHTML = "";

            const categories = {};

            data.forEach(item => {
                const fileName = item.name;
                const category = fileName.replace(/_\d+\.json$/, "");

                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(fileName);
            });

            Object.keys(categories).forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category.replace(/_/g, " ");
                categorySelect.appendChild(option);
            });

            categorySelect.addEventListener("change", () => {
                examButtonsDiv.innerHTML = "";
                categories[categorySelect.value].forEach(fileName => {
                    const button = document.createElement("button");
                    button.textContent = fileName.replace(/_/g, " ").replace(".json", "");
                    button.onclick = () => {
                        window.location.href = `index.html?exam=${fileName}`;
                    };
                    examButtonsDiv.appendChild(button);
                });
            });

            categorySelect.dispatchEvent(new Event("change"));
        })
        .catch(error => console.error("Error cargando la lista de exámenes:", error));
}

function loadExam(examName) {
    fetch(`https://raw.githubusercontent.com/FranManre/FranManre.github.io/main/test-game/exams/${examName}`)
        .then(response => response.json())
        .then(exam => {
            document.getElementById("exam-title").textContent = examName.replace(/_/g, " ").replace(".json", "");
            document.getElementById("exam-list").classList.add("hidden");
            document.getElementById("quiz-container").classList.remove("hidden");
            showQuestion(exam);
        })
        .catch(error => console.error("Error cargando el examen:", error));
}

function showQuestion(exam) {
    let index = 0;
    let correctAnswers = 0;

    function displayQuestion() {
        const questionObj = exam[index];
        document.getElementById("question-text").textContent = questionObj.question;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        Object.entries(questionObj.options).forEach(([key, text]) => {
            const btn = document.createElement("button");
            btn.textContent = `${key.toUpperCase()}: ${text}`;
            btn.onclick = () => {
                if (key === questionObj.solution) correctAnswers++;
                index++;
                if (index < exam.length) {
                    displayQuestion();
                } else {
                    showResults(exam.length, correctAnswers);
                }
            };
            optionsDiv.appendChild(btn);
        });
    }

    displayQuestion();
}

function showResults(total, correct) {
    const percentage = (correct / total) * 100;
    document.getElementById("results").innerHTML = `
        <h2>Resultados</h2>
        <p>Acertadas: ${correct}/${total} (${percentage.toFixed(2)}%)</p>
        <button onclick="window.location.href='index.html'">Volver al inicio</button>
    `;
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
}