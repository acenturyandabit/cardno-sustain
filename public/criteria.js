var criteria = {
    fishCount: {
        area: "Ecological",
        type: "options",
        prompt: "Availability of fish:",
        scores: {
            "High": 10,
            "Medium": 5,
            "Low": 0
        },
        weighting: 0.1
    },
    fishSize: {
        area: "Ecological",
        type: "number",
        prompt: "Size of fish (cm)",
        weighting: 0.5
    }
}

function generateHTML() {
    //Generate based on the options defined in this file.
    for (let i in criteria) {
        let opt = criteria[i];
        let div = document.querySelector(`.sustArea[data-divshow="${opt.area}"]>div`);
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
        cdiv.dataset.divshow=i;
        let template = document.createElement("p");
        template.dataset.field = i;
        switch (opt.type) {
            case "options":
                template.innerText = opt.prompt;
                let slc = document.createElement("select");
                for (let xi in opt.scores) {
                    let opt = document.createElement("option");
                    opt.innerText = xi;
                    slc.appendChild(opt);
                }
                template.appendChild(slc);
                break;
            case "number":
                template.innerText = opt.prompt;
                let inpt = document.createElement("input");
                inpt.type = "number";
                template.appendChild(inpt);
                break;
        }
        cdiv.appendChild(template);
        div.insertBefore(cdiv,div.querySelector(".sustainability_areas_add"));

        let sl = document.querySelector(`.sustArea[data-divshow="${opt.area}"]>div>select`);
        let ctop = document.createElement("option");
        ctop.value = i;
        ctop.innerText = opt.prompt;
        sl.appendChild(ctop);
    }
}

function calculateWeightings() {
    //fired on load and on switching to dashboard
    //calculate EVERYTHING for EVERYONE
}