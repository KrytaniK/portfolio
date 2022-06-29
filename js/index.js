
/* --------- Contact Form Setup using EmailJS ---------- */
            // https://www.emailjs.com/docs/

emailjs.init("-VHsHLzghCLGrCT4x");

const contactForm = document.getElementById('form-contact');
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    contactForm.contact_number.value = Math.random() * 100000 | 0;
    emailjs.sendForm("service_afq2pps", "template_i7gq3sx", contactForm)
        .then(
            () => console.log('Success')
        ).catch(
            (err) => console.log(err)
        );
})

/* ---------- Page Interaction ---------- */

// Scroll To Elements

const ScrollTo = (className) => {
    const element = document.querySelector(className);

    if (!element) return;
    
    element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}

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