/* --------- Notifications ---------- */

const notifPortal = document.getElementById('portal');
const notify = (notification) => {
    // Create and style DOM Element
    const notif = document.createElement('div');
    notif.classList.add('notif', 'notif-inactive', 'b-blue', 'b-shadow');

    // Set notification contents
    notif.textContent = notification;

    // Add Notification to DOM
    notifPortal.append(notif);

    // A sort of convoluted way to delay the animations and destroy
    // the notification element... Need a better way to do this.
    setTimeout(() => {
        // Immediately show the notification
        notif.classList.remove('notif-inactive');
        notif.classList.add('notif-active');
        setTimeout(() => {
            // after 3 seconds (1 second to allow for animation), hide this
            // notification.
            notif.classList.add('notif-inactive');
            notif.classList.remove('notif-active');
            setTimeout(() => {
                // after 1 second to allow for animation to finish,
                // remove this notification from the DOM.
                notifPortal.removeChild(notif);
            }, 1000)
        }, 4000)
    }, 0)
}

notify('Hello There!');

/* --------- Contact Form Setup using EmailJS ---------- */
            // https://www.emailjs.com/docs/

emailjs.init("-VHsHLzghCLGrCT4x");

const contactForm = document.getElementById('form-contact');
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const notif = document.createElement('div');
    notif.classList.add('notif', 'notif-inactive', 'b-blue', 'b-shadow-reverse');

    contactForm.contact_number.value = Math.random() * 100000 | 0;
    emailjs.sendForm("service_afq2pps", "template_i7gq3sx", contactForm)
        .then(
            () => {
                notify('Sent Successfully!');
                console.log('sent');
            }
        ).catch(
            (err) => {
                notify('Something Went Wrong...');
                console.log(err);
            }
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

//  Canvas Interaction Menu | Particle System Settings Menu

const PSettingsMenu = document.getElementById('particleSettings');

const openPSettingsButton = document.getElementById('openPSettings');
openPSettingsButton.addEventListener('click', (event) => {
    event.preventDefault();

    openPSettingsButton.classList.add('is-animated');
    PSettingsMenu.classList.add('is-animated');
});

const closePSettingsButton = document.getElementById('closePSettings');
closePSettingsButton.addEventListener('click', (event) => {
    event.preventDefault();

    openPSettingsButton.classList.remove('is-animated');
    PSettingsMenu.classList.remove('is-animated');
});
