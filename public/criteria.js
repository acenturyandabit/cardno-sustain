var criteria = {
    floorspace: {
        area: "Energy",
        type: "number",
        prompt: "Floor space (m^2)",
        weighting: function (floorspace) {
            return 100-stat("euse")/floorspace*0.1;
        }
    },
    occrate: {
        area: "Energy",
        type: "number",
        prompt: "Hours building is occupied per week",
        weighting: -0.7775,
        description: "An occupied building is over 20% full."
    },
    ncomp: {
        area: "Energy",
        type: "number",
        prompt: "No. computers constantly on",
        weighting: -0.4
    },
    euse: {
        area: "Energy",
        type: "number",
        prompt: "Yearly energy use (kWh):",
        weighting: -0.1
    }
}

var cpm;
function stat(st){
    return (cpm[st])|| 0;
}

function generateHTML() {
    //Generate based on the options defined in this file.
    for (let i in criteria) {
        let opt = criteria[i];
        let div = document.querySelector(`.sustArea[data-divshow="${opt.area}"]`);
        //if the div doesnt exist, create it
        if (!div) {
            div = document.createElement("div");
            div.classList.add("sustArea");
            div.dataset.divshow = opt.area;
            div.innerHTML =
                `<h3>${opt.area} Sustainability</h3>
            <div class="sustainability_areas_add">
            <h3>Add criteria:</h3>
            
            <select data-divshow="${opt.area}Criteria">
            </select>
            <button data-divshow="${opt.area}Criteria">Add</button>
            </div>`;
            document.querySelector(".maingroup[data-tabname='detailtab']").insertBefore(div, document.querySelector(".sustainability_areas_add"));
            let xarea = document.querySelector("select[data-divshow='sustArea']");
            let nop = document.createElement("option");
            nop.value = opt.area;
            nop.innerText = opt.area;
            xarea.appendChild(nop);
        }
        let cdiv = document.createElement("div");
        cdiv.classList.add("criteria");
        cdiv.classList.add(opt.area + "criteria");
        cdiv.dataset.divshow = i;
        let template = document.createElement("p");
        switch (opt.type) {
            case "options":
                template.innerText = opt.prompt + ":";
                let slc = document.createElement("select");
                for (let xi in opt.scores) {
                    let _opt = document.createElement("option");
                    _opt.innerText = xi;
                    slc.appendChild(_opt);
                }
                slc.dataset.field = i;
                template.appendChild(slc);
                break;
            case "number":
                template.innerText = opt.prompt;
                let inpt = document.createElement("input");
                inpt.type = "number";
                inpt.dataset.field = i;
                template.appendChild(inpt);
                break;
        }
        if (opt.description) {
            let dp = document.createElement("span");
            dp.innerText = "(?)";
            dp.classList.add("descriptionquery");
            template.appendChild(dp);
            //description div itself
            let dcdv = document.createElement("div");
            dcdv.innerHTML = opt.description;
            dp.appendChild(dcdv);
        }

        cdiv.appendChild(template);
        div.insertBefore(cdiv, div.querySelector(".sustainability_areas_add"));

        let sl = document.querySelector(`.sustArea[data-divshow="${opt.area}"]>div>select`);
        let ctop = document.createElement("option");
        ctop.value = i;
        ctop.innerText = opt.prompt;
        sl.appendChild(ctop);
    }
}

function criteriamap(ct, dt) {
    let criterium = criteria[ct];
    let val;
    switch (criterium.type) {
        case "options":
            val = criterium.scores[dt];
            break;
        case "number":
            val = dt;
            break;

    }
    let w = criterium.weighting;
    if (typeof w =="function")return w(val);
    else return val*w;
}

function calculateWeightings() {
    //fired on load and on switching to dashboard
    for (let component = 0; component < basedata.components.length - 1; component++) {
        let cmpnt = basedata.components[component];
        cmpnt.calculated = {};
        cpm=cmpnt.data;
        for (let dt in cmpnt.data) {
            try {
                if (!cmpnt.calculated[criteria[dt].area]) cmpnt.calculated[criteria[dt].area] = 0;
                cmpnt.calculated[criteria[dt].area] += criteriamap(dt, cmpnt.data[dt]);
            } catch (e) {
                console.log(`Criteria ${dt} unrecognised 3:`);
            }
        }
    }
    //For the final component, sum all the other component weights. 
    //[of only ACTIVATED components; then consider the theoretical maximum as well seperately.]
    let finalcmpnt = basedata.components[basedata.components.length - 1];
    finalcmpnt.calculated = {};
    for (let component = 0; component < basedata.components.length - 1; component++) {
        let cmpnt = basedata.components[component];
        if (cmpnt.active || component==0)//baseline
            for (let dt in cmpnt.calculated) {
                if (!finalcmpnt.calculated[dt]) finalcmpnt.calculated[dt] = 0;
                finalcmpnt.calculated[dt] += cmpnt.calculated[dt];
            }
    }
}

function renderDashboard() {
    //update calculations
    calculateWeightings();
    //change the main displays
    let finalcmpnt = basedata.components[basedata.components.length - 1];
    let finalscore = 0;
    if (!finalcmpnt.calculated || !Object.keys(finalcmpnt.calculated).length) {
        document.querySelector("[data-metafield='Score']").innerText = "-- ";
        document.querySelector(".gstar").style.width = 0 + "px";
    } else {
        for (let i in finalcmpnt.calculated) {
            finalscore += finalcmpnt.calculated[i];
        }
        document.querySelector("[data-metafield='Score']").innerText = Math.round(finalscore);
        //green star rating
        if (finalscore > 100) finalscore = 100;
        document.querySelector(".gstar").style.width = finalscore + "px";
    }
    //update the dashboard
    let db = document.querySelector(".dashboardCategories");
    db.innerHTML = "";
    let index = basedata.selectedComponent;
    for (let i = 0; i < basedata.components.length; i++) {
        if (basedata.components[i].id == index) {
            index = i;
            break;
        }
    }
    let ccpnt = basedata.components[index];
    if (!ccpnt.calculated || !Object.keys(ccpnt.calculated).length) {
        let db = document.querySelector(".dashboardCategories");
        db.innerHTML = "<h1> Click on the 'Details' tab to start entering project details.</h1>";
    } else {
        for (let i in ccpnt.calculated) {
            let d = document.createElement("div");
            d.innerHTML = `
            <h1>${i} Sustainability</h1>
            <p>Score: ${ccpnt.calculated[i]}/100</p>
        `;
            if (index == basedata.components.length - 1) {
                let cgreen = ccpnt.calculated[i];
                if (cgreen > 120) cgreen = 120;
                if (cgreen < 0) cgreen = 0;
                d.style.background = `hsla(${cgreen},100%,50%,0.5)`
            } else {
                let clite = ccpnt.calculated[i];
                let cred = (ccpnt.calculated[i] > 0) ? 120 : 0;
                if (clite < 0) clite = -clite * 3;
                if (clite > 100) clite = 100;
                d.style.background = `hsla(${cred},${clite}%,50%,0.5)`
            }
            db.appendChild(d);
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
    document.addEventListener("click", () => {
        saveOnNavigate();
        calculateWeightings();
        renderDashboard();
    });
    document.addEventListener("input", () => {
        saveOnNavigate();
        calculateWeightings();
        renderDashboard();
    });
})