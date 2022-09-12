//data varible coming from asset.jsonp
const storageName = data["courseName"] + " " + data["courseUniqueId"];
const QUOTA_EXCEEDED_ERROR_MESSAGE = "Local storage is full.Please clear your browser cache before taking any action.";
const UNEXPECTED_ERROR_MESSAGE = "Unexpected error! \n(Please check console for more details)";

console.log(data, ": main data")
console.log(sessionStorage.getItem("Google"))
document.querySelector("#module").style.display = "none"

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

function getLocalStorage(storageName, emptyValue) {
    try {
        let storage = JSON.parse(localStorage.getItem(storageName));
        if (!storage) {
            storage = emptyValue;
            localStorage.setItem(storageName, JSON.stringify(storage));
        }
        return storage
    } catch (e) {
        console.error(e);
        if (isQuotaExceeded(e)) {
          alert(QUOTA_EXCEEDED_ERROR_MESSAGE);
        }
        alert(UNEXPECTED_ERROR_MESSAGE);
    }
}

function setLocalStorage(storageName, value) {
    try {
        localStorage.setItem(storageName,value);
    } catch (e) {
        console.error(e);
        if (isQuotaExceeded(e)) {
          alert(QUOTA_EXCEEDED_ERROR_MESSAGE);
        }
        alert(UNEXPECTED_ERROR_MESSAGE);
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

Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
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

class ExamBuilder {
    constructor(examData) {
        this.examData = examData;
        this.noOfQuestionSpan = document.querySelector("#noOfQuestion .available-question");
        this.coursesDiv = document.querySelector("#courses");
        this.moduleIframe = document.querySelector("#testModule");
        this.emptyLocalVarible = {
            "usedIdList": [],
            "markedIdList": [],
            "incorrectIdList": [],
            "correctIdList": []
        }
        this.noOfQuestion = 0;
        this.labelIdCounter = 0;
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
        this.examData["subjects"].forEach(data => {
            questionLength += data["length"];
        });
        return questionLength;
    }


    getQuestionMode() {
        return document.querySelector('input[name="question-mode"]:checked').getAttribute("data")
    }

    setNoOfQuestion(length) {
        this.noOfQuestion = length;
        this.noOfQuestionSpan.innerText = length;
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
    setDisabledAll(arr) {
        arr.forEach(div => {
            if (!div.classList.contains('checkbox-disabled')) {
                div.classList.add("checkbox-disabled");
            }
        });
    }

    initDATA() {
        let checkExits = (arr, key, value) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i][key] == value) {
                    return i;
                }
            }
            return false;
        };
        let storage = this.getLocalStorage();

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

        document.title = this.examData["courseName"] + " Homepage";

        let label = this.createLabel(`course-${ this.labelIdCounter }`, this.examData["courseName"], "RADIO");
        this.labelIdCounter += 1;
        label.querySelector("input").setAttribute("checked", "");
        this.coursesDiv.appendChild(label);
        let topicWrapper = document.createElement("div");
        topicWrapper.classList.add("topic-wrapper");

        let systemList = [];

        let subjectsDiv = document.querySelector("#subjects");
        let systemsDiv = document.querySelector("#systems");

        let subjectsLength = this.examData["subjects"].length;

        let col = document.createElement("div");
        col.setAttribute("class", "col");
       
        for (let i = 0; i < subjectsLength; i++) {
            
            let subject = this.examData["subjects"][i];
            let subjectLabel = this.createLabel(`content-${ this.labelIdCounter }`, subject["name"], "CHECKBOX", subject['length']);
            this.labelIdCounter += 1;
            
            for (let x = 0; x < subject["data"].length; x++) {
                let subjectData = subject['data'][x];
                
                let systemIndex = checkExits(systemList, "name", subjectData["name"]);

                let system = null;
                if (Number.isInteger(systemIndex)) {
                    system = systemList[systemIndex];
                } else {
                    system = {
                        "name": subjectData["name"],
                        "cats": []
                    }
                }
               
                for (let y = 0; y < subjectData["categorys"].length; y++) {
                    let cat = subjectData["categorys"][y];
                 
                    if (!system['cats'].includes(cat["name"])) {
                        system['cats'].push(cat["name"]);
                    }
                }

                if (Number.isInteger(systemIndex)) {
                    systemList[systemIndex] = system;
                } else {
                    systemList.push(system);
                }
            
            }
            
            subjectLabel.querySelector("input").addEventListener("input", (e) => {
                let qMODE = this.getQuestionMode();
                let storage = this.getLocalStorage();
                
                let subjectInput = e.currentTarget;
                systemsDiv.querySelectorAll(".checkbox-label").forEach(label => {
                    let isHeaderChecked = label.querySelector("input").checked;
                    let systemText = label.querySelector(".content-text").innerText;
                    subject["data"].forEach(system => {
                        if (systemText == system["name"]) {
                            let systemIdList = [];
                            let systemAvailableQuestion = parseInt(label.querySelector(".available-question").innerText);
                            label.nextSibling.querySelectorAll("label").forEach(categoryLabel => {
                                let categoryText = categoryLabel.querySelector(".content-text").innerText;
                                system["categorys"].forEach(category => {
                                    if (categoryText == category["name"]) {
                                        let categoryIdList = [];
                                        let categoryAvailableQuestion = parseInt(categoryLabel.querySelector(".available-question").innerText);
                                        category["idList"].forEach(id => {
                                            if (qMODE == "UNUSED") {
                                                if (!storage["usedIdList"].includes(id)) {
                                                    categoryIdList.push(id);
                                                }
                                            } else if (qMODE == "USED") {
                                                if (storage["usedIdList"].includes(id)) {
                                                    categoryIdList.push(id);
                                                }
                                            } else if (qMODE == "MARKED") {
                                                if (storage["markedIdList"].includes(id)) {
                                                    categoryIdList.push(id);
                                                }
                                            } else if (qMODE == "CORRECT") {
                                                if (storage["correctIdList"].includes(id)) {
                                                    categoryIdList.push(id);
                                                }
                                            } else if (qMODE == "INCORRECT") {
                                                if (storage["incorrectIdList"].includes(id)) {
                                                    categoryIdList.push(id);
                                                }
                                            } else if (qMODE == "ALL") {
                                                categoryIdList.push(id);
                                            }
                                        });
                                        systemIdList = [].concat(systemIdList, categoryIdList);
                                        (subjectInput.checked) ? categoryAvailableQuestion += categoryIdList.length: categoryAvailableQuestion -= categoryIdList.length;
                                        categoryLabel.querySelector(".available-question").innerText = categoryAvailableQuestion;
                                        if (categoryAvailableQuestion == 0) {
                                            categoryLabel.classList.add("checkbox-disabled");
                                            categoryLabel.querySelector("input").checked = false;
                                        } else if(categoryLabel.classList.contains("checkbox-disabled")){
                                            categoryLabel.classList.remove("checkbox-disabled");
                                            categoryLabel.querySelector("input").checked = isHeaderChecked;
                                        }
                                    }
                                });
                            });
                            (subjectInput.checked) ? systemAvailableQuestion += systemIdList.length: systemAvailableQuestion -= systemIdList.length;
                            label.querySelector(".available-question").innerText = systemAvailableQuestion;
                            if (systemAvailableQuestion == 0) {
                                label.classList.add("checkbox-disabled");
                                label.querySelector("input").checked = false;
                            } else if(label.classList.contains("checkbox-disabled")){
                                label.classList.remove("checkbox-disabled");
                                if (document.querySelector(".system-row .header input").checked) {
                                    
                                    label.querySelector("input").checked = true;
                                    label.querySelector("input").dispatchEvent(new Event("input"));
                                }
                            }
                        }
                    });
                });
            });
            col.appendChild(subjectLabel);
            
            if (i == Math.round(subjectsLength / 2) - 1) {
                subjectsDiv.appendChild(col);
                col = document.createElement("div");
                col.setAttribute("class", "col");
            }
        }
        subjectsDiv.appendChild(col);
        
        let systemLength = systemList.length
        col = document.createElement("div");
        col.setAttribute("class", "col");
        for (let i = 0; i < systemLength; i++) {
            let system = systemList[i];
            let systemLabel = this.createLabel(`content-${ this.labelIdCounter }`, system["name"], "CHECKBOX", "0");
            let catWrapper = document.createElement("div");
            catWrapper.setAttribute("for-target", `content-${this.labelIdCounter }`)
            catWrapper.setAttribute("class", "cat-wrapper");
            this.labelIdCounter += 1;
            let expand = document.createElement("div");
           
            expand.classList.add("expand");
            expand.innerHTML = "&plus;";
            
            expand.setAttribute("area-expanded", "false");
            catWrapper.style.display = "none";

            expand.addEventListener("click", (e) => {
                e.preventDefault();
                let areaExpanded = expand.getAttribute("area-expanded");
                if (areaExpanded == "true") {
                    expand.innerHTML = "&plus;";
                    catWrapper.style.display = "none";
                    expand.setAttribute("area-expanded", "false");
                } else if (areaExpanded == "false") {
                    expand.innerHTML = "&minus;";
                    catWrapper.style.display = "block";
                    expand.setAttribute("area-expanded", "true");
                }
            });
            systemLabel.appendChild(expand);
            system["cats"].forEach(cat => {
                let catLabel = this.createLabel(`content-${this.labelIdCounter}`, cat, "CHECKBOX", "0");
                catWrapper.appendChild(catLabel);
                this.labelIdCounter += 1;
            });
            col.appendChild(systemLabel);
            col.appendChild(catWrapper);
            if (i == Math.round(systemLength / 2) - 1) {
                systemsDiv.appendChild(col);
                col = document.createElement("div");
                col.setAttribute("class", "col");
            }
        }
        systemsDiv.appendChild(col);
        this.setDisabledAll(systemsDiv.querySelectorAll(".checkbox-label"));
    }

    initListeners() {
        document.querySelector(".create-test").addEventListener("click", async(e) => {
            if (this.noOfQuestion == 0) {
                alert("There is no available questions !")
                return
            }
            if (this.numberOfQuestion <= 0 || this.numberOfQuestion > this.noOfQuestion || isNaN(this.numberOfQuestion)) {
                alert("Please enter valid 'Number Of Questions' number.");
                return
            }
            if (this.secondsPerQuestion <= 0 || isNaN(this.secondsPerQuestion)) {
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
                alert("Allowed maximum seconds 360 for questions");
                return;
            }
            document.title = this.examData["courseName"] + " Test";
            document.body.classList.add("generating");
            e.currentTarget.setAttribute("disabled", "");
            e.currentTarget.innerText = "Generating...";
            let promiseList = [];
            let QUESTION_DATA = [];
            let subjectList = [];
            let systemList = [];
            let subjectsDiv = document.querySelector("#subjects");
            let systemsDiv = document.querySelector("#systems");

            subjectsDiv.querySelectorAll(".checkbox-label input:checked").forEach(checkedInput => {
                let subjectText = checkedInput.parentElement.querySelector(".content-text").innerText;
                subjectList.push(subjectText);
            });

            systemsDiv.querySelectorAll("#systems .col > label:not(.checkbox-disabled) input").forEach(headerSystemInput => {
                let label = headerSystemInput.parentElement;
                let headerSystemText = label.querySelector(".content-text").innerText;
                let systemDict = {
                    "name": headerSystemText,
                    "cats": []
                }
                let forTarget = label.getAttribute("for");
                let checkedInputList = document.querySelectorAll(`div[for-target='${forTarget}'] input:checked`);
                checkedInputList.forEach(checkedInput => {
                    let systemCatText = checkedInput.parentElement.querySelector(".content-text").innerText;
                    systemDict["cats"].push(systemCatText);
                });
                if (checkedInputList.length > 0) {
                    systemList.push(systemDict);
                }
            });


            this.examData["subjects"].forEach(subject => {
                if (subjectList.includes(subject["name"])) {
                    subject["data"].forEach(subjectData => {
                        systemList.forEach(system => {
                            if (system["name"] == subjectData["name"]) {
                                subjectData["categorys"].forEach(category => {
                                    if (system["cats"].includes(category['name'])) {
                                        this.topicList.push(category["jsonp"]);
                                    }
                                });
                            }
                        });
                    });
                }
            });

            console.time("JSONP LOADING TIME");
            
            // for (let i = 0; i < this.topicList.length; i++) {
            //     let jsonp = await readJSONP(this.topicList[i]);
            //     promiseList.push(jsonp);
            // }
            
            for (let i = 0; i < questions.length; i++) {
                let list = await readQuestion(questions[i])
                promiseList.push(list);
            }
            
            console.log(promiseList)

            Promise.allSettled(promiseList).then(results => {
                
                results.forEach(result => {
                    QUESTION_DATA = [].concat(QUESTION_DATA, result.value);
                });
                console.timeEnd("JSONP LOADING TIME")
                let qMODE = this.getQuestionMode();
                let storage = this.getLocalStorage();
                let testData = [];
                QUESTION_DATA = shuffle(QUESTION_DATA);
                for (let i = 0; i < QUESTION_DATA.length; i++) {
                    if (qMODE == "USED") {
                        if (storage["usedIdList"].includes(QUESTION_DATA[i]["id"])) {
                            testData.push(QUESTION_DATA[i]);
                        }
                    } else if (qMODE == "UNUSED") {
                        if (!storage["usedIdList"].includes(QUESTION_DATA[i]["id"])) {
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
                    } else if (qMODE == "ALL") {
                        testData.push(QUESTION_DATA[i]);
                    }
                }
                document.body.classList.remove("generating");
                let content = {
                    "type": "LOAD_QUESTIONS",
                    "questionData": testData,
                    "secondsPerQuestion": this.secondsPerQuestion,
                    "numberOfQuestion": this.numberOfQuestion,
                    "markedData": storage["markedIdList"]
                }
                examBuild(content)
                
                document.querySelector("#q-container").remove()
                document.querySelector("#header-main").remove()
                document.querySelector("#modal-cookies").remove()

                var linkNodeFirst = document.getElementsByTagName('link')[3]
                var linkNodeSecond = document.getElementsByTagName('link')[4]

                linkNodeFirst.parentNode.removeChild(linkNodeFirst);
                linkNodeSecond.parentNode.removeChild(linkNodeSecond);

                document.querySelector("#module").style.display = "block"
                // this.moduleIframe.src = '/static/htmlAsset/html/Module.html';
                // this.moduleIframe.style.display = "block";
                
                // this.moduleIframe.addEventListener("load", () => {
                //     document.querySelector("#examBuilder").style.display = "none";
                //     this.moduleIframe.contentWindow.postMessage({
                //         "type": "LOAD_QUESTIONS",
                //         "questionData": testData,
                //         "secondsPerQuestion": this.secondsPerQuestion,
                //         "numberOfQuestion": this.numberOfQuestion,
                //         "markedData": storage["markedIdList"]
                //     }, "*");
                //     document.body.style.overflow = "hidden";
                // });
            });
        });

        document.querySelector(".system-row .header input").addEventListener("input", (e) => {
            let rowHeader = e.currentTarget;
            document.querySelectorAll("#systems .col > label:not(.checkbox-disabled) input").forEach(subInput => {
                if (rowHeader.checked != subInput.checked) {
                    subInput.checked = rowHeader.checked;
                    subInput.setAttribute("header-action", "");
                    subInput.dispatchEvent(new Event('input'));
                }
            });
        });

        document.querySelector(".subject-row .header input").addEventListener("input", (e) => {
            let headerInput = e.currentTarget;
            let subInputs = document.querySelectorAll("#subjects .checkbox-label:not(.checkbox-disabled) input");
            subInputs.forEach(subInput => {
                if (subInput.checked != headerInput.checked) {
                    subInput.checked = headerInput.checked;
                    subInput.setAttribute("header-action", "");
                    subInput.dispatchEvent(new Event('input'));
                }
            });
        });

        document.querySelectorAll("#subjects .checkbox-label").forEach(label => {
            let subInput = label.querySelector("input");
            let headerInput = document.querySelector(".subject-row .header input");
            let checkAllChecked = (domList) => {
                let isAllChecked = true;
                for (let i = 0; i < domList.length; i++) {
                    if (!domList[i].checked) {
                        isAllChecked = false;
                        break
                    }
                }
                return isAllChecked;
            };
            subInput.addEventListener("input", () => {
                let subInputs = document.querySelectorAll("#subjects .checkbox-label:not(.checkbox-disabled) input");
                if (subInput.hasAttribute("header-action")) {
                    subInput.removeAttribute("header-action");
                } else {
                    let isAllChecked = checkAllChecked(subInputs);
                    headerInput.checked = isAllChecked;
                }
            });
        });

        document.querySelectorAll("#systems .col > .checkbox-label").forEach(label => {
            let checkAllChecked = (domList) => {
                let isAllChecked = true;
                for (let i = 0; i < domList.length; i++) {
                    if (!domList[i].checked) {
                        isAllChecked = false;
                        break
                    }
                }
                return isAllChecked;
            };
            let headerInput = label.querySelector("input");
            let forTarget = label.getAttribute("for");
            let catWrapper = document.querySelector(`.cat-wrapper[for-target='${forTarget}']`);
            headerInput.addEventListener("input", (e) => {
                let subInputs = catWrapper.querySelectorAll(".checkbox-label:not(.checkbox-disabled) input");
                subInputs.forEach(subInput => {
                    if (subInput.checked != headerInput.checked) {
                        subInput.checked = headerInput.checked;
                        subInput.setAttribute("header-action", "");
                        subInput.dispatchEvent(new Event('input'));
                    }
                });
            });
            catWrapper.querySelectorAll(".checkbox-label input").forEach(subInput => {
                subInput.addEventListener("input", () => {
                    let subInputs = catWrapper.querySelectorAll(".checkbox-label:not(.checkbox-disabled) input");
                    if (subInput.hasAttribute("header-action")) {
                        subInput.removeAttribute("header-action");
                    } else {
                        let isAllChecked = checkAllChecked(subInputs);
                        headerInput.checked = isAllChecked;
                    }
                });
            });
        });

        document.querySelectorAll("#systems .checkbox-label, #subjects .checkbox-label").forEach(label => {
            let input = label.querySelector("input");
            let getNoOfQuestion = () => {
                let noOfQuestion = 0;
                document.querySelectorAll("#systems .cat-wrapper .checkbox-label:not(.checkbox-disabled)").forEach(checkboxLabel => {
                    let input = checkboxLabel.querySelector("input");
                    if (input.checked) {
                        let availableQuestion = checkboxLabel.querySelector(".available-question");
                        noOfQuestion += parseInt(availableQuestion.innerText);
                    }
                });
                return noOfQuestion;
            }
            input.addEventListener("input", (e) => {
                let noOfQuestion = getNoOfQuestion();
                let numberOfQuestionEl = document.querySelector("#numberOfQuestion");
                numberOfQuestionEl.value = (noOfQuestion >= 100) ? 100 : noOfQuestion;
                numberOfQuestionEl.dispatchEvent(new Event("input"));
                this.setNoOfQuestion(noOfQuestion);
                this.calculateTime();
            });
        });

        document.querySelectorAll('input[name="question-mode"]').forEach(qModeInput => {
            qModeInput.addEventListener("change", () => {
                let findLabel = (text) => {
                    let subjects = document.querySelectorAll("#subjects .checkbox-label");
                    for (let i = 0; i < subjects.length; i++) {
                        let contentText = subjects[i].querySelector(".content-text").innerText;
                        if (contentText == text) {
                            return subjects[i];
                        }
                    }
                    return false;
                };
                let qMode = qModeInput.getAttribute("data");
                let storage = this.getLocalStorage();
                document.querySelectorAll("#systems .checkbox-label").forEach(label => {
                    label.querySelector("input").checked = false;
                    label.querySelector(".available-question").innerText = "0";
                    if (!label.classList.contains("checkbox-disabled")) {
                        label.classList.add("checkbox-disabled");
                    }
                });

                document.querySelectorAll(".system-row .header input, .subject-row .header input").forEach(input => {
                    if (input.checked) input.checked = false;
                });


                document.querySelectorAll("#subjects .checkbox-label").forEach(label => {
                    label.querySelector("input").checked = false;
                    label.querySelector(".available-question").innerText = "0";
                });

                this.examData["subjects"].forEach(subject => {
                    let subjectLabel = findLabel(subject['name']);
                    let subjectLength = 0;
                    let catList = [];
                    subject["data"].forEach(system => {
                        catList = [].concat(catList, system["categorys"]);
                    });
                    catList.forEach(cat => {
                        cat["idList"].forEach(id => {
                            if (qMode == "UNUSED") {
                                if (!storage['usedIdList'].includes(id)) {
                                    subjectLength += 1;
                                }
                            } else if (qMode == "USED") {
                                if (storage['usedIdList'].includes(id)) {
                                    subjectLength += 1;
                                }
                            } else if (qMode == "MARKED") {
                                if (storage['markedIdList'].includes(id)) {
                                    subjectLength += 1;
                                }
                            } else if (qMode == "CORRECT") {
                                if (storage['correctIdList'].includes(id)) {
                                    subjectLength += 1;
                                }
                            } else if (qMode == "INCORRECT") {
                                if (storage['incorrectIdList'].includes(id)) {
                                    subjectLength += 1;
                                }
                            } else if (qMode == "ALL") {
                                subjectLength += 1;
                            }
                        });
                    });
                    subjectLabel.querySelector(".available-question").innerText = subjectLength;
                    if (subjectLength == 0 && !subjectLabel.classList.contains("checkbox-disabled")) {
                        subjectLabel.classList.add("checkbox-disabled");
                    } else if (subjectLength > 0 && subjectLabel.classList.contains("checkbox-disabled")) {
                        subjectLabel.classList.remove("checkbox-disabled");
                    }
                });

                this.topicList = [];
                this.noOfQuestion = 0;
                document.querySelector("#numberOfQuestion").value = this.noOfQuestion;
                document.querySelector("#numberOfQuestion").dispatchEvent(new Event("input"));
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
        this.initDATA();
        this.initListeners();
    }
}

const examBuilder = new ExamBuilder(data);
examBuilder.init();

document.querySelectorAll(".subject-row input, .system-row input", (input) => {
    if (input.checked) input.checked = false
});

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
        setLocalStorage(storageName, JSON.stringify(storage));
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