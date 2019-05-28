function loadReports() {
    for (let i in basedata.ratings) {
        addNewReportTab(i);
    }
    //load tabs and etc.
}

function addNewReportTab(rguid) {
    let tr = document.querySelector(".tabbar.reports");
    let nt = document.createElement("p");
    nt.dataset.group = "reportgroup";
    nt.dataset.tabname = rguid;
    nt.contentEditable = true;
    nt.innerText = basedata.ratings[rguid].properName;
    tr.insertBefore(nt, document.querySelector(".tabbar>[data-group='reportgroup'][data-tabname='new']"));
    //create a new template tab for an external criterion
    let nd = document.createElement("div");
    nd.classList.add("reportgroup");
    nd.dataset.tabname = rguid;
    nd.innerHTML = `
        <h2>Report</h2>    
        <p>Rated value:<input type="number"></p>
        <p>Has the value been certified? <input type="checkbox"></p>
        <h2>Upload report</h2>
        <input type="file">
        <p><a target="_blank">No file uploaded yet.</a></p>
        
        <!---->
        `;
    nd.querySelector("input[type='number']").value = basedata.ratings[rguid].value;
    nd.querySelector("input[type='checkbox']").checked = !basedata.ratings[rguid].isEstimated;
    if (basedata.ratings[rguid].fileurl) {
        nd.querySelector("a").href = basedata.ratings[rguid].fileurl;
        nd.querySelector("a").innerText = "Download File";
    }
    nd.classList.add(".reportgroup");
    nd.dataset.tabname = rguid;
    document.querySelector(".hypergroup[data-tabname='xreporting']").appendChild(nd);
    let tbs = document.querySelectorAll(`.reportgroup`);
    for (let i = 0; i < tbs.length; i++) {
        tbs[i].style.display = "none";
    }
    let tbi = document.querySelectorAll(`.tabbar>[data-group='reportgroup']`);
    for (let i = 0; i < tbs.length; i++) {
        tbi[i].classList.remove("selected");
    }
    nd.style.display = "block";
    nt.classList.add("selected");
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tabbar>[data-group='reportgroup'][data-tabname='new']").addEventListener("click", () => {
        //add a new tab item
        let rguid = guid();
        basedata.ratings[rguid] = {
            value: 0,
            properName: "New Report"
        };
        addNewReportTab(rguid);
    });

    //upload file handler
    //Changing the name of the report 
    document.querySelector(".tabbar.reports").addEventListener("keyup", (e) => {
        if (e.target.matches("p") && !e.target.matches("[unmanaged]")) {
            basedata.ratings[e.target.dataset.tabname].properName = e.target.innerHTML;
        }
    });
    //Changing the value of the report 
    document.querySelector(".hypergroup[data-tabname='xreporting']").addEventListener("input", (e) => {
        if (e.target.matches("input[type='number']")) {
            basedata.ratings[e.target.parentElement.parentElement.dataset.tabname].value = e.target.value;
        } else if (e.target.matches("input[type='file']")) {
            // Create a reference to 'the image id'
            let ff = e.target;
            let tn = e.target.parentElement.dataset.tabname;
            let name = "cardno_" + usp.get("docName") + "_report" + tn;
            let cimref = storageRef.child(name);
            cimref.put(ff.files[0]).then((ref) => {
                cimref.getDownloadURL().then((url) => {
                    basedata.ratings[tn].fileurl = url;
                    db.collection("cardno").doc(usp.get("docName")).update(basedata);
                    ff.parentElement.querySelector("a").innerText = "Download file";
                    ff.parentElement.querySelector("a").href = url;
                });
            });

        }else if (e.target.matches("input[type='checkbox']")) {
            basedata.ratings[e.target.parentElement.parentElement.dataset.tabname].isEstimated = !e.target.checked;
        }
    });
    setTimeout(renderOverview);
})