var circleSettings = {
    sectors: ["Energy", "Water", "Waste", "Indoor Environment"],
    r0: 10,
    r1: 400,
    w: 500,
    h: 500
}

function renderCircle(data) {
    //extract sector information
    if (!data) {
        data = {};
        for (let i = 0; i < circleSettings.sectors.length; i++) {
            try {
                data[circleSettings.sectors[i]] = basedata.components[basedata.components.length - 1].calculated[circleSettings.sectors[i]] || 0;
            } catch (e) {
                data[circleSettings.sectors[i]] = 0;
            }
        }
    }
    let _data = data;
    data = [];
    for (let i in _data) {
        data.push({
            name: i,
            v: _data[i]
        });
    }
    let c = document.querySelector(".ringer");
    c.width = circleSettings.w = c.clientWidth;
    c.height = circleSettings.h = c.clientHeight;
    let md = Math.min(c.width, c.height) / 2;
    circleSettings.r0 = md / 30;
    circleSettings.r1 = md * 29 / 30;
    let ctx = c.getContext('2d');
    let nsectors = Object.keys(data).length;
    //draw the sectors
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < data.length; i++) {
        if (data[i].v<0) data[i].v=0;
        ctx.beginPath();
        let angleStart = i * 2 * Math.PI / nsectors;
        let angleEnd = (i + 1) * 2 * Math.PI / nsectors;
        let scaledR = data[i].v / 100 * (circleSettings.r1 - circleSettings.r0) + circleSettings.r0;
        ctx.moveTo(circleSettings.w / 2 + circleSettings.r0 * Math.cos(angleStart), circleSettings.h / 2 + circleSettings.r0 * Math.sin(angleStart));
        ctx.arc(circleSettings.w / 2, circleSettings.h / 2, circleSettings.r0, angleStart, angleEnd);
        ctx.lineTo(circleSettings.w / 2 + scaledR * Math.cos(angleEnd), circleSettings.h / 2 + scaledR * Math.sin(angleEnd));
        ctx.arc(circleSettings.w / 2, circleSettings.h / 2, scaledR, angleEnd, angleStart, true);
        ctx.lineTo(circleSettings.w / 2 + circleSettings.r0 * Math.cos(angleStart), circleSettings.h / 2 + circleSettings.r0 * Math.sin(angleStart));
        let h = (data[i].v) / 100 * 120;
        ctx.fillStyle = `hsl(${h},100%,50%)`;
        ctx.fill();
        //draw the bars
        ctx.stroke();
        ctx.closePath();
        //draw the text
        ctx.fillStyle = "black";
    }
    ctx.font = `${Math.floor(md/10)}px sans-serif`;
    ctx.textAlign = "center";
    for (let i = 0; i < data.length; i++) {
        let angleStart = i * 2 * Math.PI / nsectors;
        let angleEnd = (i + 1) * 2 * Math.PI / nsectors;
        let scaledR = 50 / 100 * (circleSettings.r1 - circleSettings.r0) + circleSettings.r0;
        ctx.fillText(data[i].name, circleSettings.w / 2 + scaledR * Math.cos((angleStart + angleEnd) / 2), circleSettings.h / 2 + scaledR * Math.sin((angleStart + angleEnd) / 2));
        ctx.beginPath();
        ctx.moveTo(circleSettings.w / 2 + circleSettings.r0 * Math.cos(angleStart), circleSettings.h / 2 + circleSettings.r0 * Math.sin(angleStart));
        ctx.lineTo(circleSettings.w / 2 + circleSettings.r1 * Math.cos(angleStart), circleSettings.h / 2 + circleSettings.r1 * Math.sin(angleStart));
        ctx.stroke();
        ctx.closePath();
    }
    //draw the rings
    for (let i = 0; i < 11; i++) {
        ctx.beginPath();
        let sr = i * (circleSettings.r1 - circleSettings.r0) / 10 + circleSettings.r0;
        ctx.moveTo(circleSettings.w / 2 + sr, circleSettings.h / 2);
        ctx.arc(circleSettings.w / 2, circleSettings.h / 2, sr, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }


}

function renderOverview() {
    //update calculations



    //Render star scores, if applicable
    // Add Star rating things.
    let sratebox = document.querySelector(".sratebox");
    let ihtml = ``;
    for (let i in basedata.ratings) {
        ihtml += `
        <h2>${ (basedata.ratings[i].isEstimated)?"Estimated ": ""} ${basedata.ratings[i].properName} rating: 
        <img src="sixstar.png" style="height: 21px; width: ${Math.floor(basedata.ratings[i].value/5*100)}px; object-fit:cover;
        object-position: left;"> <span>${basedata.ratings[i].value}</span></h2>`;
    }
    sratebox.innerHTML = ihtml;

    //update the dashboard
    let db = document.querySelector(".catbox");
    db.innerHTML = "";
    let index = basedata.components.length - 1;
    let ccpnt = basedata.components[index];
    if (!ccpnt.calculated || !Object.keys(ccpnt.calculated).length) {
        let db = document.querySelector(".catbox");
        db.innerHTML = "<h2> Click on the 'Project components' tab to start entering project details.</h2>";
    } else {
        for (let i in ccpnt.calculated) {
            if (categories[i]){
                if (categories[i].hidden)continue;
            }
            let d = document.createElement("div");
            let ihtml = `
                <h1>${i} Sustainability</h1>
                <p>Score: ${Math.round(ccpnt.calculated[i])}/100</p>
            `;
            let dd = [];
            for (let dtp in ccpnt.data) {
                try {
                    if (criteria[dtp].area == i) {

                        dd.push({
                            ct: dtp,
                            prio: criteria[dtp].displayPriority || 0
                        });
                    }
                } catch (e) {
                    console.log("invalid criteria: " + dtp);
                }
            }
            dd.sort((a, b) => {
                return a.prio - b.prio
            });
            dd = dd.slice(0, 5);
            for (let jj = 0; jj < dd.length; jj++) {
                ihtml += `<p>${criteria[dd[jj].ct].prompt}: ${ccpnt.data[dd[jj].ct]}</p>`;
            }
            d.innerHTML = ihtml;
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

    setTimeout(renderCircle);
}

document.addEventListener("DOMContentLoaded", () => {
    calculateWeightings();
    document.querySelector(".tabbar>[data-group='hypergroup']").addEventListener("click", renderOverview);
    setTimeout(renderOverview);
})