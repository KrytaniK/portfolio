var ctx, canvas;

const particles = [],
    P_COLORS = ['#DA0037', '#444', '#00DACD'],
    P_SHAPES = ['Rectangle', 'Circle', 'Triangle'],
    P_COUNT = 75,
    P_MIN_SPEED = .15,
    P_MAX_SPEED = 1.25,
    P_MAX_LIFE = 3000,
    P_MAX_HEIGHT = 4;

// Rendering

initRenderer();
createParticles();

function initRenderer() {
    canvas = document.querySelector('#bg-canvas');

    //  if canvas context isn't supported, doesn't exist, or is hidden, abort.
    if (!canvas.getContext || !canvas || canvas.style.display === "none") return;

    ctx = canvas.getContext('2d');

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    render();
}

function render() {
    if (!ctx) return;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update 'Particles'
    for (let p of particles) {
        p.update();
    }

    requestAnimationFrame(render);
}

// Panning 'Particle' System

function Particle(originX, originY, width, height, index) {
    this.update = update;

    // Variables
    var lifespan = Math.max(Math.floor(Math.random() * P_MAX_LIFE), 180),
        speed = Math.max(Math.random() * P_MAX_SPEED, P_MIN_SPEED),
        x = originX,
        y = originY,
        w = width,
        h = height,
        color = P_COLORS[randomInt(0, 2)],
        opacity = 0,
        shape = P_SHAPES[randomInt(0, 2)],
        i = index;
    
    function update() {
        
        lifespan--;
        
        const alphaThreshold = (canvas.width / 2);
        opacity = Math.min(x / alphaThreshold, 1);
        
        x += speed;
        
        // Particles slow down as they get closer to thier goal
        if (x > canvas.width / 2 && speed > .25) {
            speed *= .9999;
        }

        // Draw this particle
        draw();

        // Replace this particle if it travels off-screen
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            replace();
        }
    }

    function draw() {
        // Sets the context settings for this draw pass
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;

        switch (shape) {
            case 'Rectangle':
                ctx.fillRect(x, y, w, h);
                return;
            case 'Triangle':
                const tWidth = w / 3;
                ctx.beginPath();
                ctx.moveTo(x, y - tWidth);
                ctx.lineTo(x - tWidth, y + tWidth);
                ctx.lineTo(x + tWidth, y + tWidth);
                ctx.lineTo(x, y - tWidth);
                ctx.fill();
                ctx.closePath();
                return;
            case 'Circle':
                ctx.beginPath();
                ctx.arc(x, y, w / 3, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.closePath();
                return;
        }
    }

    function replace() {
        // Calculate a new y-position, width and height for the new 'particle'
        const newY = Math.ceil(Math.random() * canvas.height),
            height = randomInt(1, P_MAX_HEIGHT),
            width = height * randomInt(5, 10);
        
        // Replace the old particle with a new one with the updated values
        particles.splice(i, 1, new Particle(0, newY, width, height, i));
    }
}

function createParticles() {
    for (let i = 0; i < P_COUNT; i++) {
        const x = Math.ceil(Math.random() * canvas.width),
            y = Math.ceil(Math.random() * canvas.height),
            height = randomInt(1, P_MAX_HEIGHT),
            width = height * randomInt(5, 10);

        particles.push(new Particle(x, y, width, height, i));
    }
}

// Helper Methods

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}