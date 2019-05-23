firebase.initializeApp({
    apiKey: "AIzaSyA6BWGYXmRWuxSLs7DphRZg8UNDO4l5tUE",
    authDomain: "usyd-shenanigans.firebaseapp.com",
    databaseURL: "https://usyd-shenanigans.firebaseio.com",
    projectId: "usyd-shenanigans",
    storageBucket: "usyd-shenanigans.appspot.com",
    messagingSenderId: "355342936960"
});
var db = firebase.firestore();
db.settings({
    timestampsInSnapshots: true
});
let usp = new URLSearchParams(window.location.search);

function saveOnNavigate() {
    let fields = document.querySelectorAll("[data-field]");
    //turn the entire page into one saveable glob
    //deal with metafields first
    let metafields = document.querySelectorAll("[data-metafield]");
    for (let i = 0; i < metafields.length; i++) {
        basedata[metafields[i].dataset.metafield] = metafields[i].value || metafields[i].innerText;
    }

    let obj = {};
    let displayName = document.querySelector(`[data-component="${basedata.selectedComponent}"]`).innerText;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].matches("[data-activated='true']")) {
            obj[fields[i].dataset.field] = fields[i].value || fields[i].innerText;
        }
    }
    for (let i in basedata.components) {
        if (basedata.components[i].id == basedata.selectedComponent) {
            basedata.components[i].data = obj;
            basedata.components[i].displayName = displayName;
        }
    }
}

function saveNow() {
    saveOnNavigate();
    //Save to firebase.
    db.collection("cardno").doc(usp.get("docName")).set(basedata);

}

function guid(count = 6) {
    let pool = "1234567890";
    tguid = "";
    for (i = 0; i < count; i++) tguid += pool[Math.floor(Math.random() * pool.length)];
    return tguid;
}

var basedata = {
    selectedComponent: "baseline",
    components: [{
            id: "baseline",
            displayName: "Baseline",
            data: {}
        },
        {
            id: "fresult",
            displayName: "Final result",
            data: {}
        }
    ]
};

function loadNow(data) {
    basedata = data;
    //load metadata
    for (let i in basedata) {
        let field = document.querySelector(`[data-metafield="${i}"]`);
        if (field) {
            if (field.value != undefined) field.value = basedata[i];
            else field.innerText = basedata[i];
        }
    }

    //load all components in projectComponents
    let extras = document.querySelectorAll("[data-component]:not([data-special])");
    for (let i = 0; i < extras.length; i++) {
        extras[i].remove();
    }
    let aa = document.querySelector("[data-component='Add']");
    for (let i = 0; i < basedata.components.length; i++) {
        if (!isNaN(Number(basedata.components[i].id))) {
            let nc = document.createElement("p");
            nc.innerText = basedata.components[i].displayName;
            nc.dataset.component = basedata.components[i].id;
            nc.contentEditable = true;
            aa.parentElement.insertBefore(nc, aa);
        }
    }
    //load selected component
    renderComponent(basedata.selectedComponent);
}

function renderComponent(index) {
    //deselect all other components
    let tbs = document.querySelectorAll(`.projectComponents>p`);
    for (let i = 0; i < tbs.length; i++) {
        tbs[i].classList.remove("selected");
    }
    if (typeof index != "Number") {
        for (let i = 0; i < basedata.components.length; i++) {
            if (basedata.components[i].id == index) {
                index = i;
                break;
            }
        }
    }
    basedata.selectedComponent = basedata.components[index].id;
    document.querySelector(`[data-component="${basedata.selectedComponent}"]`).classList.add("selected");
    let data = basedata.components[index].data;
    //deactivate everything
    let acts = document.querySelectorAll("[data-activated]");
    for (let i = 0; i < acts.length; i++) {
        acts[i].dataset.activated = false;
    }
    // Clean up - hide all sustaarea and criteria
    let all = document.querySelectorAll(".sustArea, .criteria");
    for (let i = 0; i < all.length; i++) all[i].style.display = "none";
    for (let i in data) {
        showOption(i, data[i]);
    }
}

function showOption(i, value) {
    try {
        let field = document.querySelector(`[data-field="${i}"]`);
        if (field.value != undefined) field.value = value;
        else field.innerText = value;
        field.dataset.activated = true;
        let _field = field;
        while (_field != document.body) {
            if (_field.classList.contains("criteria") || _field.classList.contains("sustArea")) _field.style.display = "block";
            _field = _field.parentElement;
        }
    } catch (e) {
        console.log(`Ack! We couldn't load property ${i}.`);
    }
}

function evaluateScore() {
    //calculate the score for each segment
}


document.addEventListener("DOMContentLoaded", () => {
    generateHTML();
    //Load stuff
    if (usp.has("docName") || usp.has("dbg")) {
        //Load stuff from the database; put up a wall until accessible
        document.body.querySelector(".landing").style.display = "none";
        document.body.querySelector(".loading").style.display = "block";
        //get the database going
        if (!usp.has("dbg")) {
            db.collection("cardno").doc(usp.get('docName')).get().then((d) => {
                document.body.querySelector(".loading").style.display = "none";
                loadNow(d.data());
                document.body.querySelector(".main_body_div").style.display = "block";
            })
        } else {
            document.body.querySelector(".loading").style.display = "none";
            document.body.querySelector(".main_body_div").style.display = "block";
        }
        //Buttons ready for scalable adding
        document.body.addEventListener("click", (e) => {
            if (e.target.matches("button[data-divshow]")) {
                let v = document.querySelector(`select[data-divshow='${e.target.dataset.divshow}']`).value;
                document.querySelector(`.${e.target.dataset.divshow}[data-divshow='${v}']`).style.display = "block";
                document.querySelector(`.${e.target.dataset.divshow}[data-divshow='${v}']`).dataset.activated = true;
                document.querySelector(`select[data-divshow='${e.target.dataset.divshow}'] option[value='${v}']`).style.display = "none";
                document.querySelector(`select[data-divshow='${e.target.dataset.divshow}']`).value = "Select...";
            }
        })
        //tabbar
        document.body.addEventListener("click", (e) => {
            if (e.target.matches(".tabbar>p")) {
                //hide all other tabs
                let tbs = document.querySelectorAll(`.${e.target.dataset.group}`);
                for (let i = 0; i < tbs.length; i++) {
                    tbs[i].style.display = "none";
                }
                //show relevant tab
                document.querySelector(`.${e.target.dataset.group}[data-tabname="${e.target.dataset.tabname}"]`).style.display = "block";
            }
        })
        //project components
        document.body.addEventListener("click", (e) => {
            if (e.target.matches(".projectComponents>p")) {
                saveOnNavigate();
                //show relevant tab
                let cid = e.target.dataset.component;
                if (e.target.dataset.special == 'add') {
                    //create a new component before it
                    let nc = document.createElement("p");
                    nc.innerText = "New component";
                    nc.dataset.component = guid();
                    basedata.components.splice(basedata.components.length - 1, 0, {
                        id: nc.dataset.component,
                        displayName: "New Component",
                        data: {}
                    });
                    cid = nc.dataset.component;
                    nc.contentEditable = true;
                    e.target.parentElement.insertBefore(nc, e.target);
                }
                renderComponent(cid);
            }
        })
    } else {
        //add event handler for the Go button
        document.body.querySelector(".landing button").addEventListener("click", () => {
            window.location.href = "?docName=" + document.body.querySelector(".landing input").value;
        })
    }
    document.body.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key == "s") {
            e.preventDefault();
            saveNow();
        }
    });
});