const viewWork = document.querySelector('#viewWork');
viewWork.addEventListener('click', (event) => {
    event.preventDefault();
    ScrollTo('.projects');
});

function ScrollTo(className) {
    const element = document.querySelector(className);
    element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
}