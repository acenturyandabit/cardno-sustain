// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
window.addEventListener("beforeprint", () => {
    //generate stuff
    let pb = document.querySelector("div.print_body");
    pb.innerHTML = ``;
    for (let i = 0; i < basedata.components.length; i++) {
        let dv = document.createElement("div");
        dv.innerHTML = `<h2>${basedata.components[i].displayName}`;
        for (let j in basedata.components[i].data) {
            try {
                dv.innerHTML += `<p>${criteria[j].prompt}: ${basedata.components[i].data[j]}</p>`
            } catch (e) {
                console.log(`Criteria ${j} unrecognised for printing.`);
            }
        }
        dv.innerHTML += "<hr>";
        pb.appendChild(dv);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".xport").addEventListener("click", () => {
        saveOnNavigate();
        download(JSON.stringify(basedata), basedata.Name + ".cardno", 'text/plain')
    });
    document.body.querySelector(".impt").addEventListener("change", function (e) {
        let input = e.target;
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                console.log(e);
                loadNow(JSON.parse(e.target.result));
            };
            reader.readAsText(input.files[0]);
        }
    })
})