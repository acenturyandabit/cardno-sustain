var DEMO = false;

var categories = {
    //special satistics for categories here...
    //may add formulae for calculation in the future.
    Summary: {
        hidden: true
    }
}

var criteria = {
    floorspace: {
        area: "Summary",
        type: "number",
        displayPriority: 1,
        prompt: "Floor space (m^2)",
        weighting: 0
    },
    occrate: {
        area: "Summary",
        type: "number",
        prompt: "Hours building is occupied per week",
        weighting: 0,
        description: "An occupied building is over 20% full."
    },
    ncomp: {
        area: "Energy",
        type: "number",
        prompt: "No. computers turned on",
        weighting: -0.4
    },
    euse: {
        area: "Energy",
        type: "number",
        prompt: "12 Month Energy use (kWh)",
        weighting: function (euse) {
            return 100 - euse / (stat('floorspace') * stat('occrate'));
        }
    },
    gpower: {
        area: "Energy",
        type: "number",
        prompt: "Greenpower electricity percentage",
        description: "The GreenPower Program (the Program) is a government managed scheme that enables Australian households and businesses to displace their electricity usage with certified renewable energy, which is added to the grid on their behalf.  ",
        weighting: 5
    },
    ngas: {
        area: "Energy",
        type: "number",
        prompt: "Yearly Natural gas use (MJ):",
        weighting: () => {
            return 100 - euse / (stat('floorspace') * stat('occrate'));
        }
    },
    dsll: {
        area: "Energy",
        type: "number",
        prompt: "Yearly Diesel use (L):",
        weighting: -0.1
    },
    wuse: {
        area: "Water",
        type: "number",
        prompt: "Yearly Water Usage(L):",
        weighting: -0.01
    },
    xrwtr: {
        area: "Water",
        type: "number",
        prompt: "Percentage of externally recycled water:",
        weighting: 1
    },
    gwaste: {
        area: "Waste",
        type: "number",
        prompt: "Yearly general waste (kg):",
        weighting: -0.1
    },
    mrecyc: {
        area: "Waste",
        type: "number",
        prompt: "Yearly Mixed Recycling (kg):",
        weighting: 0.1
    },
    airqual: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Particulate matter (ug/m^3):",
        description: "This measures airborne particles less than 10 micrometres in diameter, which can be generated from a range of sources, such as mould, traffic and printers.",
        weighting: -0.1
    },
    venteff: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Ventilation effectiveness (%):",
        description: "This measures the amount of fresh air entering a building. We use the difference in CO2 levels between inside and outside the building to determine ventilation effectiveness, as per ASHRAE 62.1. CO2 levels outside are typically around 410 ppm. Enter the percentage of samples for which CO2 levels inside the building are no more than 810 ppm.",
        weighting: 0.1
    },
    vocc: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Total Volatile Organic compounds (ppm):",
        description: "Volatile organic compounds are released as a result of tenant activities and the materials selected for fit out, such as paint and carpet.",
        weighting: -0.1
    },
    formaldh: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Formaldehyde (ppm):",
        description: "Formaldehyde is associated with the office fit out. It is emitted from flooring, furnishings and adhesives.",
        weighting: -0.1
    },
    illux: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Horizontal illuminance (%):",
        description: "The data for lighting is based on spot measurements taken throughout the building over the course of one day. Enter the percentage of samples for which horizontal light is 320 lux or greater.",
        weighting: 0.1
    },
    xcous: {
        area: "Indoor Environment",
        type: "number",
        prompt: "Acoustic comfort (%):",
        description: "The data for acoustic comfort is based on spot measurements taken throughout the building over the course of one day.Enter the percentage of readings that fall between 40-45 dB.",
        weighting: -0.1
    },
}

var cpm;

function stat(st) {
    return (cpm[st]) || 0;
}

function updateFrontBoard() {
    // go through all statistics in final projec; figure out which ones are worth displaying
    let ld = basedata.components[basedata.components.length - 1].data;
    let dd = [];
    for (let i in ld) {
        try {
            dd.push({
                ct: i,
                prio: criteria[i].displayPriority || 0
            });
        } catch (e) {
            console.log("invalid criteria: " + i);
        }
    }
    dd.sort((a, b) => {
        return a.prio - b.prio
    });
    dd = dd.slice(0, 5);
    let ihtml = ``;
    for (let i = 0; i < dd.length; i++) {
        let rcol = Math.abs((basedata.target[dd[i].ct] - ld[dd[i].ct]) / basedata.target[dd[i].ct]);
        if (rcol > 1) rcol = 1;
        rcol = 1 - rcol;
        let h = rcol * 120;
        ihtml += `<p style="background: hsl(${h},100%,50%)">${criteria[dd[i].ct].prompt}: ${ld[dd[i].ct]}</p>`;
    }
    document.querySelector(".cnt_stat").innerHTML = ihtml;
    let tgttt = document.querySelector(".tgt_stat");
    tgttt.innerHTML = "";
    for (let i = 0; i < dd.length; i++) {
        let template = document.createElement("p");
        let opt = criteria[dd[i].ct];
        switch (opt.type) {
            case "options":
                template.innerText = opt.prompt + ":";
                let slc = document.createElement("select");
                for (let xi in opt.scores) {
                    let _opt = document.createElement("option");
                    _opt.innerText = xi;
                    slc.appendChild(_opt);
                }
                slc.dataset.ttfield = dd[i].ct;
                slc.value = basedata.target[dd[i].ct];
                template.appendChild(slc);
                break;
            case "number":
                template.innerText = opt.prompt + ":";
                let inpt = document.createElement("input");
                inpt.type = "number";
                inpt.value = basedata.target[dd[i].ct];
                inpt.dataset.ttfield = dd[i].ct;
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
        tgttt.appendChild(template);
    }
}

function generateHTML() {
    //update current stats, target stats, project component detail


    //Generate based on the options defined in this file.
    for (let i in criteria) {
        let opt = criteria[i];
        let div = document.querySelector(`.sustArea[data-divshow="${(opt.area).replace(/ /ig,"_")}"]`);
        //if the div doesnt exist, create it
        if (!div) {
            div = document.createElement("div");
            div.classList.add("sustArea");
            div.dataset.divshow = (opt.area).replace(/ /ig, "_");
            div.innerHTML =
                `<h3>${opt.area} Sustainability</h3>
            <div class='sustainability_subareas_add'>
            <h3>Add criteria:</h3>
            
            <select data-divshow="${(opt.area).replace(/ /ig,"_")}criteria">
            </select>
            <button data-divshow="${(opt.area).replace(/ /ig,"_")}criteria">Add</button>
            </div>`;
            document.querySelector(".maingroup").insertBefore(div, document.querySelector(".sustainability_areas_add"));
            let xarea = document.querySelector("select[data-divshow='sustArea']");
            let nop = document.createElement("option");
            nop.value = (opt.area).replace(/ /ig, "_");
            nop.innerText = opt.area;
            xarea.appendChild(nop);
        }
        let cdiv = document.createElement("div");
        cdiv.classList.add("criteria");
        cdiv.classList.add((opt.area + "criteria").replace(/ /ig, "_"));
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
                template.innerText = opt.prompt + ":";
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
        div.insertBefore(cdiv, div.querySelector(".sustainability_subareas_add"));
        //Add the corresponding option.
        let sl = document.querySelector(`.sustArea[data-divshow="${(opt.area).replace(/ /ig,"_")}"]>div>select`);
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
    if (typeof w == "function") return w(val);
    else return val * w;
}



function calculateWeightings() {
    //fired on load and on switching to dashboard
    for (let component = 0; component < basedata.components.length - 1; component++) {
        let cmpnt = basedata.components[component];
        cmpnt.calculated = {};
        cpm = cmpnt.data;
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
    let finalcmpnt = basedata.components[basedata.components.length - 1];
    //Check all component areas and set zero for all of them to start.
    finalcmpnt.calculated = {};
    finalcmpnt.data = {};
    for (let i in criteria) {
        finalcmpnt.calculated[criteria[i].area] = 0;
    }

    //[of only ACTIVATED components; then consider the theoretical maximum as well seperately.]
    for (let component = 0; component < basedata.components.length - 1; component++) {
        let cmpnt = basedata.components[component];
        if (cmpnt.active || component == 0) { //baseline
            for (let dt in cmpnt.calculated) {
                if (!finalcmpnt.calculated[dt]) finalcmpnt.calculated[dt] = 0;
                finalcmpnt.calculated[dt] += Number(cmpnt.calculated[dt]);
            }
            for (let dt in cmpnt.data) {
                //add all the individual data points to get the final project data.
                if (!finalcmpnt.data[dt]) finalcmpnt.data[dt] = 0;
                finalcmpnt.data[dt] += Number(cmpnt.data[dt]);
            }
        }
    }
    // Demo mode: random numbers
    if (DEMO) {
        for (let i in criteria) {
            finalcmpnt.calculated[criteria[i].area] = Math.random() * 100;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tabbar").addEventListener("click", () => {
        saveOnNavigate();
        calculateWeightings();
        renderOverview();
        updateFrontBoard();
    });
    document.querySelector(".maingroup").addEventListener("input", () => {
        saveOnNavigate();
        calculateWeightings();
        renderOverview();
        updateFrontBoard();
    });
    let pti;
    document.querySelector(".tgt_stat").addEventListener("input", (e) => {
        if (e.target.matches("[data-ttfield]")) {
            basedata.target[e.target.dataset.ttfield] = e.target.value;
            try {
                clearTimeout(pti);
            } catch (e) {};
            pti = setTimeout(updateFrontBoard, 300);
        }
    })
})