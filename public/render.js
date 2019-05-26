var circleSettings = {
    sectors: [""],
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
                data[i] = basedata.components(basedata.components.length - 1).calculated[i] || 0;
            } catch (e) {
                data[i] = 0;
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
    ctx.textAlign="center";
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
        let sr = i* (circleSettings.r1 - circleSettings.r0)/10 + circleSettings.r0;
        ctx.moveTo(circleSettings.w / 2 + sr, circleSettings.h / 2);
        ctx.arc(circleSettings.w / 2, circleSettings.h / 2, sr, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }


}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tabbar>[data-group='hypergroup']").addEventListener("click", renderCircle);
    renderCircle();
})