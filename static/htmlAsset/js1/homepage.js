//data varible coming from asset.jsonp
const storageName = `${data["courseName"]}  ${data["courseUniqueId"]}`;

const QUOTA_EXCEEDED_ERROR_MESSAGE = "Local storage is full.Please clear your browser cache before taking any action.";
const UNEXPECTED_ERROR_MESSAGE = "Unexpected error!";

if (!Promise.allSettled) {
    Promise.allSettled = promises =>
        Promise.all(
            promises.map((promise, i) =>
                promise
                .then(value => ({
                    status: "fulfilled",
                    value,
                }))
                .catch(reason => ({
                    status: "rejected",
                    reason,
                }))
            )
        );
}

function readJSONP(src) {
    return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.setAttribute("async", "");
        script.src = src;
        script.addEventListener("load", () => {
            resolve(data);
            script.remove();
        });
        script.addEventListener("error", (e) => {
            reject(e);
            script.remove();
        });
        document.head.appendChild(script);
    });
}

function readQuestion(element){
    return new Promise((resolve, reject) => {
        if(element){
            resolve(element)
        }else{
            reject("Error")
        }
    })
}

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function getLocalStorage(storageName, emptyValue) {
   
    try {
        let storage = JSON.parse(localStorage.getItem(storageName));
        if (!storage) {
            storage = emptyValue;
            localStorage.setItem(storageName, JSON.stringify(storage));
        }
        return storage
    } catch (e) {
        if (isQuotaExceeded(e)) {
            alert(QUOTA_EXCEEDED_ERROR_MESSAGE);
        }else{
            alert(UNEXPECTED_ERROR_MESSAGE);
        }
    }
}

function setLocalStorage(storageName, value) {
    try {
        localStorage.setItem(storageName, value);
        return {
            "status": "OK"
        }
    } catch (e) {
        if (isQuotaExceeded(e)) {
            alert(QUOTA_EXCEEDED_ERROR_MESSAGE);
        }else{
            alert(UNEXPECTED_ERROR_MESSAGE);
        }
    }
}

function isQuotaExceeded(e) {
    let isQuotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    isQuotaExceeded = true
                    break;
                case 1014:
                    if (e.name == "NS_ERROR_DOM_QUOTA_REACHED") {
                        isQuotaExceeded = true;
                    }
            }
        } else if (e.number == -2147024882) {
            isQuotaExceeded = true;
        }
    }
    return isQuotaExceeded;
}

Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

class ExamBuilder {
    constructor(examData) {
        this.noOfQuestionSpan = document.querySelector("#noOfQuestion .available-question");
        this.coursesDiv = document.querySelector("#courses");
        this.moduleIframe = document.querySelector("#testModule");
        this.topicsDiv = document.querySelector("#topics");
        this.emptyLocalVarible = {
            "usedIdList": [],
            "markedIdList": [],
            "incorrectIdList": [],
            "correctIdList": []
        }
        this.examData = examData;
        this.noOfQuestion = 0;
        this.labelIdCounter = 0;
        this.labelCourseIdCounter = 0;
        this.numberOfQuestion = 100;
        this.secondsPerQuestion = 60;
        this.maxNumberOfQuestion = 200;
        this.maxSecondsPerQuestion = 360;
        this.topicList = [];
    }

    getLocalStorage() {
        return getLocalStorage(storageName, this.emptyLocalVarible);
    }

    getQuestionLength() {
        let questionLength = 0;
        this.examData["data"].forEach(data => {
            questionLength += data["length"];
        });
        return questionLength;
    }

    getLabelId() {
        let currentLabelId = this.labelIdCounter;
        this.labelIdCounter += 1;
        return currentLabelId;
    }

    getQuestionMode() {
        return document.querySelector('input[name="question-mode"]:checked').getAttribute("data")
    }

    formatTime(time) {
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

    createLabel(id, text, type, length) {
        let label = document.createElement("label");
        label.setAttribute("for", id);
        if (type == "CHECKBOX") {
            label.setAttribute("class", "checkbox-label");
            label.appendChild(this.createCheckBox(id));
            label.appendChild(this.createCheckBoxDiv());
        } else if (type == "RADIO") {
            label.setAttribute("class", "radio-label");
            label.appendChild(this.createRadio(id));
            label.appendChild(this.createRadioDiv());
        }
        label.appendChild(this.createContentSpan(text));
        if (length !== undefined) {
            label.appendChild(this.createLengthSpan(length));
        }
        return label;
    }
    createLengthSpan(length) {
        let span = document.createElement("span");
        span.setAttribute("class", "available-question");
        span.innerText = length;
        return span;
    }
    createRadio(id) {
        let input = document.createElement("input");
        input.setAttribute("type", "radio");
        input.setAttribute("id", id);
        input.setAttribute("name", "course");
        return input;
    }
    createRadioDiv() {
        let div = document.createElement("div");
        div.setAttribute("class", "radio-div");
        div.innerHTML = "<div class='dot'></div>";
        return div;
    }
    createCheckBox(id) {
        let input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("class", `content-checkbox`);
        input.setAttribute("id", id)
        return input;
    }
    createCheckBoxDiv() {
        let div = document.createElement("div");
        div.setAttribute("class", "checkbox-div");
        div.innerHTML = "<div class='tick'></div>";
        return div;
    }
    createContentSpan(text) {
        let span = document.createElement("span");
        span.innerText = text;
        span.setAttribute("class", "content-text");
        return span;
    }

    initDATA() {
      
        let storage = this.getLocalStorage();
        console.log("storage: ", storage)
        let usedQuestionLength = storage["usedIdList"].length;
        let allQuestionLength = this.getQuestionLength();
        let unusedQuestionLength = (allQuestionLength - usedQuestionLength);
        let markedQuestionLength = storage["markedIdList"].length;
        let correctQuestionLength = storage["correctIdList"].length;
        let inCorrectQuestionLength = storage["incorrectIdList"].length;
       
        document.querySelector("#all .available-question").innerText = allQuestionLength;
        document.querySelector("#used .available-question").innerText = usedQuestionLength;
        document.querySelector("#unused .available-question").innerText = unusedQuestionLength;
        document.querySelector("#correct .available-question").innerText = correctQuestionLength;
        document.querySelector("#incorrect .available-question").innerText = inCorrectQuestionLength;
        document.querySelector("#marked .available-question").innerText = markedQuestionLength;

        let headerInput = document.createElement("input");
        headerInput.setAttribute("id", "header-checkbox-0");
        headerInput.type = "checkbox";
        headerInput.classList.add("content-checkbox");
        headerInput.addEventListener("change", () => {
            this.noOfQuestion = 0;
            this.topicList = [];
            this.topicsDiv.querySelectorAll(".checkbox-label:not(.checkbox-disabled) input").forEach(topicInput => {
                topicInput.checked = headerInput.checked;
                topicInput.setAttribute("HEADER-INPUT", "");
                topicInput.dispatchEvent(new Event("change"));
            });
        });

        let checkAllTopicInputChecked = () => {
            let control = true;
            let topicsList = this.topicsDiv.querySelectorAll(".checkbox-label:not(.checkbox-disabled) input");
            for (let i = 0; i < topicsList.length; i++) {
                if (!topicsList[i].checked) {
                    control = false;
                    break
                }
            }
            return control;
        };

        document.querySelector(`label[for='header-checkbox-${this.getLabelId()}']`).prepend(headerInput);

        document.title = this.examData["courseName"] + " Homepage";
        let label = this.createLabel(`course - ${this.getLabelId()}`, this.examData["courseName"], "RADIO");
        label.querySelector("input").setAttribute("checked", "");
        this.coursesDiv.appendChild(label);
        let topicWrapper = document.createElement("div");
        topicWrapper.classList.add("topic-wrapper");

        for (let i = 0; i < this.examData["data"].length; i++) {
            let topic = this.createLabel(`content - checkbox - ${this.getLabelId()}`, this.examData["data"][i]["name"], "CHECKBOX", this.examData["data"][i]["idList"].length);
            topic.querySelector("input").addEventListener("change", (e) => {
                let input = e.currentTarget;
                if (!input.hasAttribute("HEADER-INPUT")) {
                    if (checkAllTopicInputChecked()) {
                        headerInput.checked = true;
                    } else {
                        headerInput.checked = false;
                    }
                } else {
                    input.removeAttribute("HEADER-INPUT");
                }
                let qMODE = this.getQuestionMode();
                let storage = this.getLocalStorage();
                
                let examIdData = this.examData["data"][i]["idList"];
                
                let questionIdData = [];
                console.log("examData Length: ", examIdData.length)
               
                if (qMODE == "UNUSED") {
                    for (let x = 0; x < examIdData.length; x++) {
                        if (!storage["usedIdList"].includes(examIdData[x])) {
                            questionIdData.push(examIdData[x]);
                        }
                    }
                } else if (qMODE == "USED") {
                    for (let x = 0; x < examIdData.length; x++) {
                        if (storage["usedIdList"].includes(examIdData[x])) {
                            questionIdData.push(examIdData[x]);
                        }
                    }
                } else if (qMODE == "MARKED") {
                    for (let x = 0; x < examIdData.length; x++) {
                        if (storage["markedIdList"].includes(examIdData[x])) {
                            questionIdData.push(examIdData[x]);
                        }
                }
                } else if (qMODE == "CORRECT") {
                    for (let x = 0; x < examIdData.length; x++) {
                        if (storage["correctIdList"].includes(examIdData[x])) {
                            questionIdData.push(examIdData[x]);
                        }
                    }
                } else if (qMODE == "INCORRECT") {
                    for (let x = 0; x < examIdData.length; x++) {
                        if (storage["incorrectIdList"].includes(examIdData[x])) {
                            questionIdData.push(examIdData[x]);
                        }
                    }
                } else if (qMODE == "ALL") {
                    questionIdData = examIdData;
                }
                
                if (input.checked) {
                    this.noOfQuestion += questionIdData.length;
                   
                    this.topicList.push(this.examData["data"][i]["jsonp"]);
                } else {
                    this.noOfQuestion -= questionIdData.length;
                    this.topicList = this.topicList.remove(this.examData["data"][i]["jsonp"]);
                }

                if (this.topicList.length == 0 || this.noOfQuestion < 0) {
                    this.noOfQuestion = 0;
                }

                this.noOfQuestionSpan.innerText = this.noOfQuestion;
                let numberOfQuestionEl = document.querySelector("#numberOfQuestion");
                numberOfQuestionEl.value = (this.noOfQuestion >= 100) ? 100 : this.noOfQuestion;
                numberOfQuestionEl.dispatchEvent(new Event("input"));
                if (!input.hasAttribute("HEADER-INPUT")) {
                    this.calculateTime();
                }
            });
            this.topicsDiv.appendChild(topic);
        }
    }

    initListeners() {
        document.querySelector(".create-test").addEventListener("click", async(e) => {
            if (this.noOfQuestion == 0) {
                alert("There is no available questions !")
                return
            }
            if (this.numberOfQuestion <= 0 || this.numberOfQuestion > this.noOfQuestion || isNaN(this.numberOfQuestion)) {
                document.querySelector("#numberOfQuestion").value = "";
                document.querySelector("#numberOfQuestion").dispatchEvent(new Event("input"));
                alert("Please enter valid 'Number Of Questions' number.");
                return
            }
            if (this.secondsPerQuestion <= 0 || isNaN(this.secondsPerQuestion)) {
                document.querySelector("#secPerQuestion").value = "";
                document.querySelector("#secPerQuestion").dispatchEvent(new Event("input"));
                alert("Please enter valid 'Second(s) Per Question' number.");
                return
            }
            
            if (this.numberOfQuestion > this.maxNumberOfQuestion) {
                
                document.querySelector("#numberOfQuestion").value = "200";
                document.querySelector("#numberOfQuestion").dispatchEvent(new Event("input"));
                alert("Allowed maximum question is 200");
                return;
            }
            if (this.secondsPerQuestion > this.maxSecondsPerQuestion) {
                document.querySelector("#secPerQuestion").value = "360";
                document.querySelector("#secPerQuestion").dispatchEvent(new Event("input"));
                alert("Allowed maximum seconds is 360 for question");
                return;
            }

            document.title = this.examData["courseName"] + " Test";
            document.body.classList.add("generating");
            e.currentTarget.setAttribute("disabled", "");
            e.currentTarget.innerText = "Generating...";
            let promiseList = [];
            let QUESTION_DATA = [];
            let testData = [];

            console.time("JSONP LOADING TIME")
        
            console.log("topicsList: ", this.topicList)

            for (let i = 0; i < questions.length; i++) {
                let list = await readQuestion(questions[i])
                promiseList.push(list);
            }
            
            console.log(promiseList)
            
            // console.log("promiseList", promiseList)
            // console.log(this.topicList)
            
            // for (let i = 0; i < 1; i++) {
            //     let jsonp = await readJSONP("/static/jsonp/Biliary tree.jsonp");
            //     promiseList.push(jsonp);
            // }

            Promise.allSettled(promiseList).then(results => {
                console.log("results", results)
                results.forEach(result => {
                    QUESTION_DATA = [].concat(QUESTION_DATA, result.value);
                });
                console.timeEnd("JSONP LOADING TIME")
                QUESTION_DATA = shuffle(QUESTION_DATA);
                let qMODE = this.getQuestionMode();
                let storage = this.getLocalStorage();
          
                for (let i = 0; i < QUESTION_DATA.length; i++) {
                    if (qMODE == "ALL") {
                        testData.push(QUESTION_DATA[i]);
                    } else
                    if (qMODE == "UNUSED") {
                        if (!storage["usedIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    } else if (qMODE == "USED") {
                        if (storage["usedIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    } else if (qMODE == "CORRECT") {
                        if (storage["correctIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    } else if (qMODE == "INCORRECT") {
                        if (storage["incorrectIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    } else if (qMODE == "MARKED") {
                        if (storage["markedIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    }
                }
                
                document.body.classList.remove("generating");
                this.moduleIframe.src = module_url;
                this.moduleIframe.style.display = "block";
                this.moduleIframe.addEventListener("load", () => {
                    document.querySelector("#examBuilder").style.display = "none";
                    this.moduleIframe.contentWindow.postMessage({
                        "type": "LOAD_QUESTIONS",
                        "questionData": testData,
                        "secondsPerQuestion": this.secondsPerQuestion,
                        "numberOfQuestion": this.numberOfQuestion,
                        "markedData": this.getLocalStorage()["markedIdList"]
                    }, "*");
                    document.body.style.overflow = "hidden";
                });
            });
        });
        document.querySelectorAll('input[name="question-mode"]').forEach(qModeInput => {
            qModeInput.addEventListener("change", () => {
                let qMODE = qModeInput.getAttribute("data");
                let storage = this.getLocalStorage();
                this.topicsDiv.querySelectorAll(".available-question").forEach((span, index) => {
                    let topicIdList = data["data"][index]["idList"];
                    let topicIdListLength = topicIdList.length;
                    let availableLength = 0;
                    if (qMODE == "UNUSED") {
                        for (let i = 0; i < topicIdListLength; i++) {
                            if (!storage["usedIdList"].includes(topicIdList[i])) {
                                availableLength += 1;
                            }
                        }
                    } else if (qMODE == "USED") {
                        for (let i = 0; i < topicIdListLength; i++) {
                            if (storage["usedIdList"].includes(topicIdList[i])) {
                                availableLength += 1;
                            }
                        }
                    } else if (qMODE == "MARKED") {
                        for (let i = 0; i < topicIdListLength; i++) {
                            if (storage["markedIdList"].includes(topicIdList[i])) {
                                availableLength += 1;
                            }
                        }
                    } else if (qMODE == "CORRECT") {
                        for (let i = 0; i < topicIdListLength; i++) {
                            if (storage["correctIdList"].includes(topicIdList[i])) {
                                availableLength += 1;
                            }
                        }
                    } else if (qMODE == "INCORRECT") {
                        for (let i = 0; i < topicIdListLength; i++) {
                            if (storage["incorrectIdList"].includes(topicIdList[i])) {
                                availableLength += 1;
                            }
                        }
                    } else if (qMODE == "ALL") {
                        availableLength = topicIdListLength;
                    }
                    if (availableLength == 0) {
                        span.parentElement.classList.add("checkbox-disabled");
                    } else if (availableLength > 0) {
                        span.parentElement.classList.remove("checkbox-disabled");
                    }
                    span.innerText = availableLength;
                });
                document.querySelector("#numberOfQuestion").value = "0";
                document.querySelectorAll(".content-checkbox").forEach(topicInput => {
                    if (topicInput.checked) {
                        topicInput.checked = false;
                    }
                });
                this.topicList = [];
                this.noOfQuestion = 0;
                this.noOfQuestionSpan.innerText = this.noOfQuestion;
            });
        });

        document.querySelector("#secPerQuestion").addEventListener("input", (e) => {
            this.numberOfQuestion = parseInt(document.querySelector("#numberOfQuestion").value);
            this.secondsPerQuestion = parseInt(e.currentTarget.value);
            this.calculateTime();
        });

        document.querySelector("#numberOfQuestion").addEventListener("input", (e) => {
            this.numberOfQuestion = parseInt(e.currentTarget.value);
            this.secondsPerQuestion = parseInt(document.querySelector("#secPerQuestion").value);
            this.calculateTime();
        });

    }
    calculateTime() {
        this.time = (this.numberOfQuestion > 0 && this.numberOfQuestion <= this.noOfQuestion) ? this.numberOfQuestion * this.secondsPerQuestion : 0;
        if (this.numberOfQuestion > this.maxNumberOfQuestion || this.secondsPerQuestion > this.maxSecondsPerQuestion) {
            this.time = 0;
        }
        let timeText = this.formatTime(this.time);
        let timeSuffix = "";
        let seperatorLength = timeText.split(":");
        if (seperatorLength.length == 2) {
            timeSuffix = "minute(s)";
        } else if (seperatorLength.length == 3) {
            timeSuffix = "hour(s)";
        }
        document.querySelector(".time-text").innerText = timeText + " " + timeSuffix;
    }
    init() {
        this.initListeners();
        this.initDATA();
    }
}

const examBuilder = new ExamBuilder(data);
examBuilder.init();
document.body.classList.remove("generating");
window.onmessage = (e) => {
    if (e.data["type"] == "WINDOW_RELOAD") {
        window.location.reload();
    }
    if (e.data["type"] == "ADD_TO_USED") {
        let id = e.data["id"];
        let storage = examBuilder.getLocalStorage();
        if (!storage["usedIdList"].includes(id)) {
            storage["usedIdList"].push(id);
        }
        response = setLocalStorage(storageName, JSON.stringify(storage));
    }
    if (e.data["type"] == "ADD_TO_MARKED") {
        let storage = examBuilder.getLocalStorage();
        if (!storage["markedIdList"].includes(e.data["id"])) {
            storage["markedIdList"].push(e.data["id"]);
            setLocalStorage(storageName, JSON.stringify(storage));
        }
    }
    if (e.data["type"] == "REMOVE_TO_MARKED") {
        let storage = examBuilder.getLocalStorage();
        if (storage["markedIdList"].includes(e.data["id"])) {
            storage["markedIdList"] = storage["markedIdList"].remove(e.data["id"]);
            setLocalStorage(storageName, JSON.stringify(storage));
        }
    }
    if (e.data["type"] == "EDIT_CORRECT_AND_INCORRECT") {
        let storage = examBuilder.getLocalStorage();
        for (let i = 0; i < e.data["correctIdList"].length; i++) {
            if (!storage["correctIdList"].includes(e.data["correctIdList"][i])) {
                storage["correctIdList"].push(e.data["correctIdList"][i]);
            }
            if (storage["incorrectIdList"].includes(e.data["correctIdList"][i])) {
                storage["incorrectIdList"] = storage["incorrectIdList"].remove(e.data["correctIdList"][i]);
            }
        }
        for (let i = 0; i < e.data["incorrectIdList"].length; i++) {
            if (!storage["incorrectIdList"].includes(e.data["incorrectIdList"][i])) {
                storage["incorrectIdList"].push(e.data["incorrectIdList"][i]);
            }
            if (storage["correctIdList"].includes(e.data["incorrectIdList"][i])) {
                storage["correctIdList"] = storage["correctIdList"].remove(e.data["incorrectIdList"][i]);
            }
        }
        setLocalStorage(storageName, JSON.stringify(storage));
    }
};

let iframe = document.querySelector("#testModule");
iframe.style.height = window.innerHeight + "px";

window.onresize = () => {
    let iframe = document.querySelector("#testModule");
    iframe.style.height = window.innerHeight + "px";
};

