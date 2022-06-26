const projectScrollTo = document.getElementById('projects-scrollTo'),
    aboutScrollTo = document.getElementById('about-scrollTo'),
    contactScrollTo = document.getElementById('contact-scrollTo');

projectScrollTo.addEventListener('click', (event) => {
    event.preventDefault();
    ScrollTo('.projects');
});

aboutScrollTo.addEventListener('click', (event) => {
    event.preventDefault();
    ScrollTo('.about');
});

contactScrollTo.addEventListener('click', (event) => {
    event.preventDefault();
    ScrollTo('.contact');
});

const ScrollTo = (className) => {
    const element = document.querySelector(className);

    if (!element) return;
    
    element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}