window.Zoom = function(e, t) {
    const n = t && t.originalizer ? t.originalizer : e => e,
        o = { screenWidth: 0, screenHeight: 0, scrollBar: 0 },
        r = t && t.background ? t.background : null,
        i = () => {
            const { documentElement: e } = document;
            o.screenWidth = window.innerWidth || e.clientWidth, o.screenHeight = window.innerHeight || e.clientHeight, o.scrollBar = o.screenWidth - e.offsetWidth
        },
        c = e => {
            const t = e.currentSrc || e.src,
                { srcset: i } = e,
                { screenWidth: c, screenHeight: s, scrollBar: d } = o,
                { width: l, height: m, left: h, top: g } = e.getBoundingClientRect(),
                f = (c - d) / 2 - h - l / 2,
                u = (s - m) / 2 - g,
                v = document.createElement("div"),
                w = document.createElement("img"),
                E = () => { v.classList.remove("zoom-bg--reveal"), w.style.transform = "", w.addEventListener("transitionend", () => { v.remove(), e.classList.remove("zoom-original--hidden"), w.remove() }, { once: !0 }), v.removeEventListener("click", E), w.removeEventListener("click", E), window.removeEventListener("scroll", E), window.removeEventListener("resize", E) };
            let L = e.naturalWidth;
            if (w.style.top = `${g + window.scrollY}px`, w.style.left = `${h}px`, w.style.width = `${l}px`, w.style.height = `${m}px`, v.classList.add("zoom-bg"), r)
                if ("auto" === r) {
                    const t = a(e);
                    v.style.background = t ? `rgb(${t.r}, ${t.g}, ${t.b})` : "rgb(0, 0, 0)"
                } else v.style.background = r;
            if (i) {
                const e = i.match(/ ([0-9]+)w/gm);
                e && e.forEach(e => {
                    const t = +e.trim().replace("w", "");
                    t > L && (L = t)
                })
            }
            L >= c && (L = c);
            const p = L * (m / l);
            p >= s && (L = L * s / p), w.classList.add("zoom-img"), w.src = t, w.width = l, w.height = m, v.addEventListener("click", E, { once: !0 }), w.addEventListener("click", E, { once: !0 }), window.addEventListener("scroll", E, { once: !0 }), window.addEventListener("resize", E, { once: !0 }), document.body.append(v), document.body.append(w), w.offsetWidth, e.classList.add("zoom-original--hidden");
            const y = L !== l ? L / l : 1;
            w.style.transform = `matrix(${y}, 0, 0, ${y}, ${f}, ${u})`, v.classList.add("zoom-bg--reveal"), w.addEventListener("transitionend", () => { w.src = n(t) })
        },
        s = e => { c(e.target) },
        a = e => {
            const t = { r: 0, g: 0, b: 0 },
                n = document.createElement("canvas"),
                o = n.getContext("2d");
            if (!o) return null;
            const r = n.width = e.naturalWidth || e.offsetWidth || e.width,
                i = n.height = e.naturalHeight || e.offsetHeight || e.height;
            let c, s, a = -4,
                d = 0;
            o.drawImage(e, 0, 0);
            try { c = o.getImageData(0, 0, r, i) } catch (e) { return null }
            for (s = c.data.length;
                (a += 20) < s;) ++d, t.r += c.data[a], t.g += c.data[a + 1], t.b += c.data[a + 2];
            return t.r = Math.floor(t.r / d), t.g = Math.floor(t.g / d), t.b = Math.floor(t.b / d), t
        },
        d = e => {
            if (e && ("string" == typeof e ? document.querySelectorAll(e).forEach(l) : e instanceof HTMLElement ? l(e) : (e instanceof NodeList || e instanceof Array) && e.forEach(l), "string" == typeof e)) {
                const t = document.createElement("style"),
                    n = document.head || document.getElementsByTagName("head")[0];
                t.appendChild(document.createTextNode(`${e}{cursor:zoom-in}`)), n.appendChild(t)
            }
        },
        l = e => {
            if (e instanceof HTMLElement)
                if ("IMG" === e.tagName) e.addEventListener("click", s);
                else {
                    const t = e.querySelector("img");
                    t && t.addEventListener("click", s)
                }
        };
    return i(), window.addEventListener("resize", i, { passive: !0 }), d(e), { zoom: c, attach: d }
};
! function() {
    const e = document.createElement("style"),
        t = document.head || document.getElementsByTagName("head")[0];
    e.appendChild(document.createTextNode(".zoom-bg,.zoom-img{z-index:90000;cursor:zoom-out}.zoom-img{position:absolute;display:block;will-change:transform;transition:transform .3s ease-in-out}.zoom-bg{position:fixed;top:0;left:0;width:100vw;height:100vh;background:#121212;opacity:0;will-change:opacity;transition:opacity .3s ease-in-out}.zoom-bg.zoom-bg--reveal{opacity:.95}.zoom-original--hidden{visibility:hidden}")), t.appendChild(e)
}();




function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        if (array[counter]["question"].includes('id="vignettedescriptor"') || array[index]["question"].includes('id="vignettedescriptor"') ||
            array[counter]["question"].includes('Item 2 of 2') || array[index]["question"].includes('Item 2 of 2')) {
            continue;
        }
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

class Test {
    constructor(questionData, secondsPerQuestion, numberOfQuestion, markedData) {
        this.questionExpContainer = document.querySelector(".question-exp-container");
        this.currentCountElement = document.querySelector("nav .question-info .question-counter .current");
        this.totalCountElement = document.querySelector("nav .question-info .question-counter .total");
        this.topicNameElement = document.querySelector("nav .topic-name");
        this.questionsContainer = document.querySelector("main .questions-container");
        this.questionContainer = document.querySelector("main .question-exp-container .question");
        this.expContainer = document.querySelector("main .question-exp-container .exp-container .exp");
        this.nextQuestion = document.querySelector("nav .next-button");
        this.preQuestion = document.querySelector("nav .pre-button");
        this.leftContainerButton = document.querySelector("nav .left-container-button");
        this.takeAlookTheTestButton = document.querySelector(".test-result button");
        this.finishButton = document.querySelector("nav .finish-button");
        this.resultTestButton = document.querySelector("nav .result-button");
        this.testResultoverlay = document.querySelector(".test-result");
        this.valuesButton = document.querySelector(".values");
        this.valuesWrapper = document.querySelector(".values-div-wrapper");
        this.markInput = document.querySelector("main .question-exp-container .mark-wrapper input");
        this.markedData = markedData;
        this.currentQuestion = 0;
        this.answerData = [];
        this.isFinished = false;
        this.correctQuestion = 0;
        this.incorrectQuestion = 0;
        this.unAnsweredQuestion = 0;
        this.passedTime = 0;
        this.secondsPerQuestion = secondsPerQuestion;
        this.numberOfQuestion = numberOfQuestion;
        this.questionData = questionData;
        this.time = this.secondsPerQuestion * this.numberOfQuestion;
    }
    Exhibit(elements) {
        let showExhibit = (arr) => {
            let viewer = document.createElement("div");
            viewer.setAttribute("class", "viewer-wrapper");
            let close = document.createElement("button");
            close.innerHTML = "&times;";
            close.setAttribute("class", "close-viewer");
            viewer.appendChild(close);
            close.addEventListener("click", () => {
                viewer.remove();
            });
            let navWrapper = document.createElement("div");
            navWrapper.setAttribute("class", "viewer-nav-wrapper");
            let showAsset = (index) => {
                viewer.querySelectorAll(".iframe-asset").forEach(el => el.remove());
                let asset = null;
                let path = arr[index]["path"];
                let extension = path.substring(path.lastIndexOf("."), path.length);
                if (extension == ".html") {
                    asset = document.createElement("iframe");
                    asset.setAttribute("class", "iframe-asset");
                } else if (extension == ".mp4" || extension == ".mp3") {
                    asset = document.createElement("video");
                    asset.setAttribute("class", "video-asset");
                    asset.setAttribute("controls", "");
                } else {
                    asset = document.createElement("img");
                    asset.setAttribute("class", "image-asset");
                }
                asset.src = path;
                viewer.appendChild(asset);
            };
            arr.forEach((page, index) => {
                let navButton = document.createElement("button");
                navButton.setAttribute("class", "nav-button");
                navButton.innerText = `${index + 1}`;
                navButton.addEventListener("click", () => {
                    if (navButton.classList.contains("active")) return
                    let lastAsset = viewer.querySelector("[class*='asset']");
                    if (lastAsset) lastAsset.remove()
                    let lastActive = navWrapper.querySelector(".active");
                    if (lastActive) lastActive.classList.remove("active")
                    navButton.classList.add("active");
                    showAsset(index);
                });
                navWrapper.appendChild(navButton);
            });
            viewer.append(navWrapper);
            navWrapper.querySelector("button").click();
            document.body.appendChild(viewer);
        };
        elements.forEach(element => {
            element.addEventListener("click", () => {
                let exhibitData = JSON.parse(element.getAttribute("exhibit-data"));
                showExhibit(exhibitData);
            });
        });
    }

    format(time) {
        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = ~~time % 60;
        let ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }

    getQuestions() {
        this.questionData = shuffle(this.questionData);
        let questionLength = this.questionData.length;
        let questionData = [];
        for (let i = 0; i < questionLength; i++) {
            if (this.numberOfQuestion + 1 == i + 1) break
            questionData.push({
                "question": this.questionData[i]["question"],
                "correctAnswerIndex": this.questionData[i]["correctAnswerIndex"],
                "questionId": this.questionData[i]["id"],
                "exp": this.questionData[i]["exp"]
            });
        }
        return questionData;
    }

    getMarkedData(id) {
        for (let i = 0; i < this.markedData.length; i++) {
            if (this.markedData[i]["id"] == id) {
                return this.markedData[i]["isChecked"];
            }
        }
        return false;
    }

    getAnswer(questionIndex) {
        let length = this.answerData.length;
        for (let i = 0; i < length; i++) {
            if (this.answerData[i]["currentQuestion"] == questionIndex) {
                return this.answerData[i]["selectedAnswerIndex"];
            }
        }
        return false;
    }

    getCorrectAnswerIndex(questionIndex) {
        return this.questionData[questionIndex]["correctAnswerIndex"];
    }

    setMarkedData(id, value) {
        for (let i = 0; i < this.markedData.length; i++) {
            if (id == this.markedData[i]["id"]) {
                this.markedData[i]["isChecked"] = value;
                return
            }
        }
        this.markedData.push({
            "id": id,
            "isChecked": value
        });
    }

    prepareMarkedData() {
        for (let i = 0; i < this.markedData.length; i++) {
            this.markedData[i] = {
                "id": this.markedData[i],
                "isChecked": true
            }
        }
    }

    showTestResult(time, correctQuestionCount, incorrectQuestionCount, UnansweredQuestionCount) {
        this.testResultoverlay.querySelector("#timeSpent").innerText = time;
        this.testResultoverlay.querySelector("#correctQuestion").innerText = correctQuestionCount;
        this.testResultoverlay.querySelector("#inCorrectQuestion").innerText = incorrectQuestionCount;
        this.testResultoverlay.querySelector("#unAnsweredQuestion").innerText = UnansweredQuestionCount;
        this.testResultoverlay.classList.add("show-overlay");
    }

    appendAnswer(currentQuestion, selectedAnswerIndex) {
        function isExits(currentQuestion, answerData) {
            let length = answerData.length;
            for (let i = 0; i < length; i++) {
                if (answerData[i]["currentQuestion"] == currentQuestion) {
                    return answerData[i];
                }
            }
            return false;
        }
        let data = isExits(currentQuestion, this.answerData);
        if (data) {
            data["selectedAnswerIndex"] = selectedAnswerIndex;
        } else {
            this.answerData.push({
                "currentQuestion": currentQuestion,
                "selectedAnswerIndex": selectedAnswerIndex
            });
        }
        window.parent.postMessage({
            "type": "ADD_TO_USED",
            "id": this.questionData[this.currentQuestion]["questionId"]
        }, "*")
    }

    initLayout() {
        let initToQuestionList = () => {
            let ul = this.questionsContainer.querySelector("ul");

            function createLi(text) {
                let li = document.createElement("li");
                li.innerText = text;
                return li;
            }
            let listLenght = this.questionData.length;
            for (let i = 1; i < listLenght + 1; i++) {
                let li = createLi("Question " + i.toString());
                li.addEventListener("click", () => {
                    if (window.innerWidth < 768) {
                        this.leftContainerButton.click();
                    }
                    this.currentQuestion = i - 1;
                    this.loadQuestion(i - 1);
                });
                ul.appendChild(li);
            }
        }
        this.currentCountElement.innerText = 1;
        this.totalCountElement.innerText = this.questionLength;
        initToQuestionList();
    }

    initListeners() {
        this.markInput.addEventListener("input", (e) => {
            this.setMarkedData(this.questionData[this.currentQuestion]["questionId"], e.currentTarget.checked);
            window.parent.postMessage({
                "type": (e.currentTarget.checked) ? "ADD_TO_MARKED" : "REMOVE_TO_MARKED",
                "id": this.questionData[this.currentQuestion]["questionId"]
            }, "*");
        });
        this.valuesButton.addEventListener("click", () => {
            let isOpen = this.valuesWrapper.classList.contains("show-values");
            if (isOpen) {
                this.valuesWrapper.classList.remove("show-values");
            } else {
                this.valuesWrapper.classList.add("show-values");
            }
        });

        this.leftContainerButton.addEventListener("click", () => {
            let currentDisplay = this.questionsContainer.classList.contains("hide");
            if (currentDisplay) {
                this.questionsContainer.classList.remove("hide");
                this.questionExpContainer.classList.remove("full-width");
            } else {
                this.questionsContainer.classList.add("hide");
                this.questionExpContainer.classList.add("full-width");
            }
        });
        this.takeAlookTheTestButton.addEventListener("click", () => {
            this.testResultoverlay.classList.remove("show-overlay");
        });

        this.resultTestButton.addEventListener("click", () => {
            this.showTestResult(this.passedTime, this.correctQuestion, this.incorrectQuestion, this.unAnsweredQuestion);
        });

        this.finishButton.addEventListener("click", (e) => {
            if (e.currentTarget.innerText == "Go to Homepage") {
                document.write("Loading...");
                window.location.href = "/"
                window.parent.postMessage({ type: "WINDOW_RELOAD" }, "*");
                return
            }
            this.resultTestButton.style.display = "inline-block";
            this.isFinished = true;
            clearInterval(this.Interval);
            this.finishTest();
            this.showTestResult(this.passedTime, this.correctQuestion, this.incorrectQuestion, this.unAnsweredQuestion);
            e.currentTarget.innerText = "Go to Homepage";
        });
    }

    initQuestionListeners() {
        let getAnswerIndex = input => {
            let inputList = this.questionExpContainer.querySelectorAll(".answer-radio");
            let length = inputList.length;
            for (let i = 0; i < length; i++) {
                if (inputList[i] == input) {
                    return i;
                }
            }
            console.error("ANSWER INDEX NOT FOUNDED")
        }
        this.questionExpContainer.querySelectorAll(".answer-radio").forEach(input => {

            input.addEventListener("change", (e) => {
                if (this.isFinished == false) {
                    let selectedAnswerIndex = getAnswerIndex(e.currentTarget);
                    this.appendAnswer(this.currentQuestion, selectedAnswerIndex);
                }
            });
        });

        this.questionContainer.querySelector(".pre-button").addEventListener("click", () => {
            this.currentQuestion -= 1;
            if (this.currentQuestion == -1) {
                this.currentQuestion += 1;
                return
            }
            this.loadQuestion(this.currentQuestion);
        });

        this.questionContainer.querySelector(".next-button").addEventListener("click", () => {
            this.currentQuestion += 1;
            if (this.currentQuestion == this.questionData.length) {
                this.currentQuestion -= 1;
                return
            }
            this.loadQuestion(this.currentQuestion);
        });
        this.questionContainer.querySelectorAll("img").forEach(img => {
            img.addEventListener("click", (e) => {
                e.preventDefault();
            });
        });
        this.Exhibit(this.questionContainer.querySelectorAll("[exhibit-data]"));
        Zoom(this.questionContainer.querySelectorAll("img"));
    }

    loadQuestion(index) {
        this.currentQuestion = index;
        let selectedAnswerIndex = this.getAnswer(index);
        let active = this.questionsContainer.querySelector(".active");
        if (active) active.classList.remove("active");
        if (!this.isFinished) this.questionsContainer.querySelectorAll("li")[index].classList.add("active");
        let targetQuestion = this.questionData[index];
        this.currentCountElement.innerText = index + 1;
        this.questionContainer.innerHTML = targetQuestion["question"];
        let markedChecked = this.getMarkedData(this.questionData[this.currentQuestion]["questionId"]);
        this.markInput.checked = markedChecked;

        let btnWrapper = document.createElement("div");
        btnWrapper.setAttribute("class", "nav-button-wrapper");
        let btn = document.createElement("button");
        btn.innerText = "<";
        btn.classList.add("pre-button");
        btnWrapper.append(btn);
        let btn2 = document.createElement("button");
        btn2.classList.add("next-button");
        btn2.innerText = ">";
        btnWrapper.append(btn2);
        this.questionContainer.appendChild(btnWrapper);

        this.questionExpContainer.querySelectorAll(".option").forEach((option, index) => {
            option.classList.remove("option");
            let input = option.querySelector(".answer-radio");
            input.setAttribute("id", `option-${index + 1}`);
            input.setAttribute("name", "option");
            input.remove();
            option.outerHTML = `
            <label class='radio-label option' for='option-${index + 1}'>
              ${input.outerHTML}
              <div class='radio-div'>
                <div class='dot'></div>
              </div>
              <span class='content-text'>${option.innerHTML}</span>
            </label>`;
        });

        this.questionExpContainer.querySelectorAll(".answer-radio").forEach((input, index) => {
            if (this.isFinished) input.setAttribute("disabled", "")
            if (Number.isInteger(selectedAnswerIndex)) {
                if (index == selectedAnswerIndex) {
                    input.setAttribute("checked", "");
                }
            }
        });

        if (this.isFinished) {
            this.questionContainer.innerHTML += targetQuestion["exp"];
            let options = this.questionExpContainer.querySelectorAll(".option");
            let correctAnswerIndex = this.questionData[index]["correctAnswerIndex"];
            if (selectedAnswerIndex == correctAnswerIndex) {
                options[correctAnswerIndex].classList.add("correct-option");
            } else {
                if (Number.isInteger(selectedAnswerIndex)) options[selectedAnswerIndex].classList.add("incorrect-option");
                if (Number.isInteger(correctAnswerIndex)) options[correctAnswerIndex].classList.add("correct-option");
            }
        }

        this.questionContainer.querySelectorAll("a").forEach(a => a.setAttribute("target", "_blank"));
        this.initQuestionListeners();
        this.questionExpContainer.scrollTo(0, 0);
    }

    finishTest() {
        let dataLength = this.questionData.length;
        let correctIdList = [];
        let incorrectIdList = [];
        for (let i = 0; i < dataLength; i++) {
            let check = this.getAnswer(i);
            if (Number.isInteger(check)) {
                let selectedAnswerIndex = check;
                let correctAnswerIndex = this.questionData[i]["correctAnswerIndex"];
                if (selectedAnswerIndex == correctAnswerIndex) {
                    this.questionsContainer.querySelectorAll("li")[i].classList.add("correct");
                    this.correctQuestion += 1;
                    correctIdList.push(this.questionData[i]["questionId"]);
                } else {
                    this.questionsContainer.querySelectorAll("li")[i].classList.add("incorrect");
                    incorrectIdList.push(this.questionData[i]["questionId"]);
                    this.incorrectQuestion += 1;
                }
            } else {
                this.unAnsweredQuestion += 1;
            }
        }
        window.parent.postMessage({
            "type": "EDIT_CORRECT_AND_INCORRECT",
            "correctIdList": correctIdList,
            "incorrectIdList": incorrectIdList
        }, "*");
        this.loadQuestion(0);
    }

    startTest() {
        let currentTime = this.format(this.time);
        this.topicNameElement.innerText = currentTime;

        let passedTime = 0;
        this.Interval = setInterval(() => {
            this.passedTime += 1;
            let currentTime = this.format(this.time);
            this.topicNameElement.innerText = currentTime;
            this.time -= 1;
            this.passedTime = this.format(passedTime);
            if (this.time < 0) {
                this.finishButton.click();
            }
            passedTime += 1;
        }, 1000);
    }

    create() {
        if ((localStorage.getItem("tutorial") === null || localStorage.getItem("tutorial") == false) &&
            !window.matchMedia("(pointer: coarse)").matches) {
            document.querySelector(".info-container").style.display = "block";
            localStorage.setItem("tutorial", true);
        }
        this.questionData = this.getQuestions();
        this.questionLength = this.questionData.length;
        this.prepareMarkedData();
        this.initLayout();
        this.initListeners();
        this.questionLength = this.questionData.length;
        this.startTest(this.time);
        this.currentQuestion = 0;
        this.loadQuestion(this.currentQuestion);
        if (window.innerWidth < 768) {
            this.leftContainerButton.click();
        }
        window.addEventListener("resize", () => {
            if (window.innerWidth < 768 && !this.questionsContainer.classList.contains("hide")) {
                this.leftContainerButton.click();
            }
        });
        window.addEventListener("keydown", (e) => {
            if (e.code == "ArrowRight") {
                document.querySelector(".next-button").click();
            } else if (e.code == "ArrowLeft") {
                document.querySelector(".pre-button").click();
            }
        });
    }
}

window.onload = () => {
    console.log("Page Loaded")
}

examBuild = (data) => {
    console.log("Building Exam")
    if (data.type == "LOAD_QUESTIONS") {
        let questionData = data.questionData;
        let secondsPerQuestion = data.secondsPerQuestion;
        let numberOfQuestion = data.numberOfQuestion;
        let markedData = data.markedData;
        new Test(questionData, secondsPerQuestion, numberOfQuestion, markedData).create();
        document.body.classList.remove("generating");
    }
}
// window.onmessage = (e) => {
//     if (e.data.type == "LOAD_QUESTIONS") {
//         let questionData = e.data.questionData;
//         let secondsPerQuestion = e.data.secondsPerQuestion;
//         let numberOfQuestion = e.data.numberOfQuestion;
//         let markedData = e.data.markedData;
//         new Test(questionData, secondsPerQuestion, numberOfQuestion, markedData).create();
//         document.body.classList.remove("generating");
//     }
// };