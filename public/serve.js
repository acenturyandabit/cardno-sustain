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

function saveNow() {
    let fields = document.querySelectorAll("[data-field]");
    //get the document name
    //turn the entire page into one saveable glob
    let obj = {};
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].offsetHeight > 0) {
            obj[fields[i].dataset.field] = fields[i].value || fields[i].innerText;
        }
    }
    //then save to firebase.
    db.collection("cardno").doc(usp.get("docName")).set(obj);

}

function loadNow(data) {
    for (let i in data) {
        try {
            let field = document.querySelector(`[data-field="${i}"]`);
            if (field.value != undefined) field.value = data[i];
            else field.innerText = data[i];
            let _field = field;
            while (_field != document.body) {
                if (_field.style.display=="none")_field.style.display = "block";
                _field = _field.parentElement;
            }
        } catch (e) {
            console.log(`Ack! We couldn't load property ${i}.`);
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    //Load stuff
    if (usp.has("docName")) {
        //Load stuff from the database; put up a wall until accessible
        document.body.querySelector(".landing").style.display = "none";
        document.body.querySelector(".loading").style.display = "block";
        //get the database going
        db.collection("cardno").doc(usp.get('docName')).get().then((d) => {
            document.body.querySelector(".loading").style.display = "none";
            loadNow(d.data());
            document.body.querySelector(".main_body_div").style.display = "block";
        })

        //Buttons ready for scalable adding
        document.body.addEventListener("click", (e) => {
            if (e.target.matches("button[data-divshow]")) {
                let v = document.querySelector(`select[data-divshow='${e.target.dataset.divshow}']`).value;
                document.querySelector(`.${e.target.dataset.divshow}[data-divshow='${v}']`).style.display = "block";
                document.querySelector(`select[data-divshow='${e.target.dataset.divshow}'] option[value='${v}']`).style.display = "none";
                document.querySelector(`select[data-divshow='${e.target.dataset.divshow}']`).value = "Select...";
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