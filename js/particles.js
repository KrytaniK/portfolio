// Helper Methods

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomValue(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function clamp(num, min, max) {
    return Math.min(max, Math.max(num, min));
}

class Renderer {
    #canvas;
    #context;
    #frameEvents;

    constructor(canvasID, contextType) {
        if (canvasID == '' || contextType == '') {
            throw new Error('particles.js | class Renderer | One or more invalid arguments');
        }

        const canvas = document.getElementById(canvasID);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;


        this.#canvas = canvas;
        this.#context = canvas.getContext(contextType);
        this.#frameEvents = [];

        this.#onInitialize();
        this.#render();
    }

    // Initializing phase for this class, responsible for event listeners
    //  and any pre-render checks that are needed
    #onInitialize = () => {
        this.#checkCompatibility();

        // Resize the canvas whenever there is a window resize
        window.addEventListener('resize', () => {
            this.#canvas.width = window.innerWidth;
            this.#canvas.height = window.innerHeight;
        });
    }

    #checkCompatibility = () => {
        if (!this.#canvas.getContext && !this.#canvas.getContext('2d')) {
            return new Error('Canvas Not Supported');
        }
    }

    // Update method renders each frame, locked to the refresh rate of the canvas
    #render = () => {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        
        this.#onFrameRender();

        requestAnimationFrame(this.#render);
    }

    #onFrameRender = () => {
        if (!this.#frameEvents || this.#frameEvents.length <= 0)
            return;
        
        this.#frameEvents.forEach(event => {
            event();
        });
    }

    getCanvasSize = () => {
        return {
            width: this.#canvas.width,
            height: this.#canvas.height,
        }
    }

    addFrameEvent = (event) => {
        this.#frameEvents.push(event);
    }

    clearAllFrameEvents = () => {
        this.#frameEvents = [];
    }

    drawRectangle = (x, y, dimensions, color, opacity) => {
        const { width, height } = dimensions;
        this.#context.globalAlpha = opacity;
        this.#context.fillStyle = color;
        this.#context.fillRect(x, y, width, height);
    }

    drawTriangle = (x, y, dimensions, color, opacity) => {
        const { radius } = dimensions;
        this.#context.globalAlpha = opacity;
        this.#context.fillStyle = color;
        this.#context.beginPath();
        this.#context.moveTo(x, y - radius);
        this.#context.lineTo(x - radius, y + radius);
        this.#context.lineTo(x + radius, y + radius);
        this.#context.lineTo(x, y - radius);
        this.#context.fill();
        this.#context.closePath();
    }

    drawCircle = (x, y, dimensions, color, opacity) => {
        const { radius } = dimensions;
        this.#context.globalAlpha = opacity;
        this.#context.fillStyle = color;
        this.#context.beginPath();
        this.#context.arc(x, y, radius, 0, Math.PI * 2, false);
        this.#context.fill();
        this.#context.closePath();
    }
}

class Particle {
    #size;
    #width;
    #speed;
    #origin;
    #pos;
    #color;
    #bounds;
    #forceUnitSize;
    #alphaThreshhold;
    #onDrawShape;
    #onRecycle;
    
    constructor(color, size, speed, position, bounds, forceUnitSize, alphaThreshhold, onDrawShape, onRecycle) {
        this.#size = size;
        this.#width = size * randomInt(1, 10);
        this.#color = color;
        this.#speed = speed;
        this.#origin = position;
        this.#pos = position;
        this.#bounds = bounds;
        this.#forceUnitSize = forceUnitSize;
        this.#alphaThreshhold = alphaThreshhold;
        this.#onDrawShape = onDrawShape;
        this.#onRecycle = onRecycle;
    }

    update = () => {
        this.#update();
    }

    #update = () => {
        // Updates this particles x position
        this.#pos.x += this.#speed;
        let opacity = 1;
        if (this.#pos.x < this.#alphaThreshhold)
            opacity = clamp(this.#pos.x / this.#alphaThreshhold, 0, 1);
        
        if (this.#pos.x > this.#bounds.x - this.#alphaThreshhold) {
            opacity = 1 - clamp((this.#pos.x - (this.#bounds.x - this.#alphaThreshhold)) / this.#alphaThreshhold, 0, 1);
        }

        this.#onDrawShape(
            this.#pos.x,
            this.#pos.y,
            {
                width: this.#width,
                height: this.#size,
                radius: this.#size
            },
            this.#color,
            opacity
        );

        // if this particle is out of the given bounds, recycle this
        // particle by giving it new data
        if ( this.#pos.x < 0 || this.#pos.y < 0
            || this.#pos.x >= this.#bounds.x
            || this.#pos.y >= this.#bounds.y) {
            this.#onRecycle(this);
        }
    }

    // This recycle method is called by the particle system to update ALL 
    //of the particle's relative data
    recycle = (color, size, speed, position, bounds, forceUnitSize, onDrawShape) => {
        this.#size = size;
        this.#color = color;
        this.#speed = speed;
        this.#origin = position;
        this.#pos = position;
        this.#bounds = bounds;
        this.#forceUnitSize = forceUnitSize;
        this.#onDrawShape = onDrawShape;
    }
}

class ParticleSystem {
    #_renderer;
    #_particles;
    #_p_s_settings;
    
    constructor(renderer, settings) {
        this.#_renderer = renderer;
        this.#_particles = [];
        this.#_p_s_settings = settings;

        this.#onInitialize();
    }

    #onInitialize = () => {
        this.#createParticles();

        window.addEventListener('resize', () => {
            this.#resetParticleSystem();
        });
    }

    #createParticles = () => {
        for (let i = 0; i < this.#_p_s_settings.count; i++) {
            const {
                color,
                size,
                speed,
                position,
                bounds,
                forceUnitSize,
                alphaThreshhold,
                onDrawShape
            } = this.#generateRandomParticleData();

            const p = new Particle(color, size, speed, position, bounds, forceUnitSize, alphaThreshhold, onDrawShape, this.#onParticleRecycle);
            this.#_particles.push(p);
            this.#_renderer.addFrameEvent(p.update);
        }
    }

    #resetParticleSystem = () => {
        this.#_renderer.clearAllFrameEvents();

        this.#createParticles();
    }

    #onParticleRecycle = (_particle) => {
        const {
            color,
            size,
            speed,
            position,
            bounds,
            forceUnitSize,
            onDrawShape
        } = this.#generateRandomParticleData(true);

        _particle.recycle(color, size, speed, position, bounds, forceUnitSize, onDrawShape);
    }

    #generateRandomParticleData = (forceZeroX = false) => {
        const settings = this.#_p_s_settings;
        const canvasSize = this.#_renderer.getCanvasSize();
        const shapeFunction = this.#getRandomShape(settings.shapes[randomInt(0, settings.shapes.length - 1)]);

        return {
            color: settings.colors[randomInt(0, settings.colors.length - 1)],
            size: randomInt(settings.min_size, settings.max_size),
            speed: randomValue(settings.min_speed, settings.max_speed),
            position: {
                x: forceZeroX ? 0 : Math.ceil(Math.random() * canvasSize.width),
                y: Math.ceil(Math.random() * canvasSize.height)
            },
            bounds: {
                x: canvasSize.width,
                y: canvasSize.height
            },
            forceUnitSize: settings.forceUnitSize,
            alphaThreshhold: settings.fadeInDist * canvasSize.width,
            onDrawShape: shapeFunction
        }
    }

    #getRandomShape(shape) {
        switch (shape) {
            case 'Rectangle':
                return this.#_renderer.drawRectangle;
            case 'Triangle':
                return this.#_renderer.drawTriangle;
            case 'Circle':
                return this.#_renderer.drawCircle;
        }
    }
}

const renderer = new Renderer('bg-canvas', '2d');

const pS_Settings = {
    count: 100,
    colors: ['#DA0037', '#444', '#00DACD'],
    shapes: ['Rectangle', 'Circle', 'Triangle'],
    min_speed: .15,
    max_speed: 2,
    min_size: 3,
    max_size: 7,
    forceUnitSize: false,
    fadeInDist: .5
}

const particleSystem = new ParticleSystem(renderer, pS_Settings);