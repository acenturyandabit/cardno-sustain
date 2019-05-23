document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".navbar").addEventListener("click", (e) => {
        if (e.target.matches("a[data-slide]")){
            document.querySelector(`div[data-slide='${e.target.dataset.slide}']`).scrollIntoView({behavior:"smooth"});
        }
    })
});