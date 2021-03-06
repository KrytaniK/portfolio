
//   ------------------------------------   //
/*   --------- Canvas Rendering ---------   */
//   ------------------------------------   //

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

    drawRectangle = (x, y, dimensions, color, opacity, forceUnitSize) => {
        const { width, height, size } = dimensions;

        this.#context.globalAlpha = opacity;
        this.#context.fillStyle = color;

        if (forceUnitSize) {
            this.#context.fillRect(x, y, size, size);
            return;
        }

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

//   -----------------------------------   //
/*   --------- Particle System ---------   */
//   -----------------------------------   //

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
                radius: this.#size,
                size: this.#size
            },
            this.#color,
            opacity,
            this.#forceUnitSize
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
        this.#_p_s_settings = {...settings};

        this.#onInitialize();
    }

    updateAllSettings = (newSettings) => {
        this.#_p_s_settings = { ...newSettings };

        this.#resetParticleSystem();
    }

    updateSetting = (settingID, newValue) => {
        // Make appropriate changes and re-initialize the particles.
        this.#_p_s_settings[settingID] = newValue;
        
        // Reset PS
        this.#resetParticleSystem();
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
            alphaThreshhold: settings.fadeDist * canvasSize.width,
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
            default:
                return this.#_renderer.drawRectangle;
        }
    }
}

const updateParticleSystemFromDOM = (input) => {
    // 
    switch (input.type) {
        case 'checkbox':
            particleSystem.updateSetting(input.id, input.checked);
            break;
        default:
            particleSystem.updateSetting(input.id, Number(input.value));
            break;
    }
}

const getDomValuesByID = (labels) => {
    const obj = {};
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];

        // If the label contains no value element, skip it.
        if (!label.querySelector('.value')) continue;
        
        if (!obj.hasOwnProperty(label.htmlFor)) {

            // Create and Set the object key's value, storing the 
            // label's 'value' element, rather than the label.
            obj[label.htmlFor] = label.querySelector('.value');
        }
    }
    return obj;
}

const getInputsByID = (_inputs) => {
    const obj = {}
    for (let i = 0; i < _inputs.length; i++) {
        const input = _inputs[i];

        if (input.type === 'color') continue;

        // Set the value to be the initial settings' value
        input.value = settings[input.id];
        
        if (!obj.hasOwnProperty(input.id)) {
            // Create and Set the object key's value
            obj[input.id] = input;
        }
    }
    return obj;
}

const getFieldsByID = (_fields) => {
    const obj = {}
    for (let i = 0; i < _fields.length; i++) {
        const input = _fields[i];

        // Set the value to be the initial settings' value
        input.value = settings[input.id];
        
        if (!obj.hasOwnProperty(input.id)) {
            // Create and Set the object key's value
            obj[input.id] = input;
        }
    }
    return obj;
}

const updateDOMValue = (valuesObj, key, newValue, options) => {
    if (!valuesObj[key]) return;

    if (options.isPercent) {
        valuesObj[key].textContent = (parseInt(Number(newValue) * 100)).toString() + "%";
        return;
    }

    if (options.isNumber) {
        valuesObj[key].textContent = Number(newValue);
        return;
    }

    valuesObj[key].textContent = newValue;
}

//   ----------------------------------   //
/*   --------- Initialization ---------   */
//   ----------------------------------   //

const settings = {
    count: 100,
    colors: ['#DA0037', '#444', '#00DACD'],
    shapes: ['Rectangle', 'Circle', 'Triangle'],
    min_speed: .005,
    max_speed: .1,
    min_size: 3,
    max_size: 7,
    forceUnitSize: false,
    fadeDist: .25
}

const renderer = new Renderer('bg-canvas', '2d');
const particleSystem = new ParticleSystem(renderer, settings);

//   ------------------------------------   //
/*   --------- DOM Manipulation ---------   */
//   ------------------------------------   //

// Grab all input elements corresponding to the settings ui

// **NOTE** All labels' 'for' tags need to match their relative input's ID tag
//          AND the corresponding key in the above settings object. Otherwise,
//          the lookups will read undefined, causing issues.

// Get all labels and inputs within the settings-wrapper class.
const settingsWrapper = document.querySelector('.settings-wrapper');
const labels = settingsWrapper.getElementsByTagName('label');
const inputs = settingsWrapper.getElementsByTagName('input');
const fields = settingsWrapper.getElementsByTagName('fieldset');

// Transform labels to an object structure for faster lookup.
// This object structure will store an HTML element used for
// displaying each input's value, keyed by the ID of the label.
DOMValuesByID = getDomValuesByID(labels);

// Transforms inputs to an object structure for faster lookup.
// Stores the input ID as the key, and the input element as the value.
inputsByID = getInputsByID(inputs);

// set event listeners for each input and update their initial values
inputs.forEach(input => {
    
    input.addEventListener('change', () => {
        updateDOMValue(
            DOMValuesByID,
            input.id,
            input.type === 'checkbox' ? input.checked : input.value,
            {
                isPercent: input.id === 'fadeDist',
                isNumber: input.type === 'range'
            }
        );
        updateParticleSystemFromDOM(input);
    });
    
    input.addEventListener('mousemove', () => {
        if (!DOMValuesByID[input.id]) return;

        updateDOMValue(DOMValuesByID, input.id, input.value, {
            isPercent: input.id === 'fadeDist',
            isNumber: input.type === 'range'
        });
    });

    updateDOMValue(
        DOMValuesByID,
        input.id,
        input.type === 'checkbox' ? input.checked : input.value,
        {
            isPercent: input.id === 'fadeDist',
            isNumber: input.type === 'range'
        }
    );
});


/* --------------------------------- */
/* -- Special Handling for colors -- */
/* --------------------------------- */

const fieldsByID = getFieldsByID(fields);

const addDOMColor = (color, id, container) => {

    // Create the color input. Use Aria label instead of a label element,
    // since a label element isn't needed here.
    const colorEl = document.createElement('input');
    colorEl.type = 'color';
    colorEl.id = id;
    colorEl.ariaLabel = 'Color Picker for' + id;
    colorEl.value = color;
    
    container.append(colorEl);
    return colorEl;
}

const removeDOMColor = (index) => {
    // Find the element corresponding to the last color
    const colorInputs = fieldsByID['colors'].getElementsByTagName('input');
    const colorEl = colorInputs[index];

    // Remove the element from the DOM
    fieldsByID['colors'].removeChild(colorEl);

}

let colors = [...settings.colors];

for (let i = 0; i < colors.length; i++) {
    // Add the color to the DOM
    const colorEl = addDOMColor(colors[i], 'color' + i.toString(), fieldsByID['colors']);

    // On change, update the particle system
    colorEl.addEventListener('change', () => {
        colors[i] = colorEl.value;
        particleSystem.updateSetting('colors', colors);
    })
}

const addColorBtn = document.getElementById('addColor');
addColorBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (colors.length >= 16) return;

    const index = colors.length;
    const id = 'color' + index.toString();
    const defaultColor = '#FFFFFF';

    const colorEl = addDOMColor(defaultColor, id, fieldsByID['colors']);

    // Add an event listener to update the particle system on value change
    colorEl.addEventListener('change', () => {
        colors[index] = colorEl.value;
        particleSystem.updateSetting('colors', colors);
    })

    // Update the colors array and the DOM
    colors.push(defaultColor);
    fieldsByID['colors'].append(colorEl);

    // Notify the particle system of these changes
    particleSystem.updateSetting('colors', colors);
})

const removeColorBtn = document.getElementById('removeColor');
removeColorBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (colors.length <= 1) return;

    // Remove the color input from the DOM
    removeDOMColor(colors.length - 1);

    // remove the color from the colors array
    colors.pop();

    // Notify the particle system of these changes
    particleSystem.updateSetting('colors', colors);
});


/* --------------------------------- */
/* -- Special Handling for shapes -- */
/* --------------------------------- */

let shapes = [...settings.shapes];

const addDOMShape = (shape, index, value, container) => {
    const settingWrapper = document.createElement('div');
    settingWrapper.classList.add('setting', 'flex');

    const shapeLabel = document.createElement('label');
    shapeLabel.htmlFor = shape;
    shapeLabel.textContent = shape;

    const useShape = document.createElement('input');
    useShape.type = 'checkbox';
    useShape.name = shape;
    useShape.id = shape;
    useShape.checked = value;

    settingWrapper.append(shapeLabel);
    settingWrapper.append(useShape);

    container.append(settingWrapper);

    useShape.addEventListener('change', (event) => {
        event.preventDefault();

        if (event.target.checked && shapes.includes(shape)) return;

        if (event.target.checked && !shapes.includes(shape)) {
            shapes.push(shape);
            particleSystem.updateSetting('shapes', shapes);
            return;
        }

        if (shapes.length === 1) {
            shapes = [];
            particleSystem.updateSetting('shapes', shapes);
            return;
        }

        const index = shapes.indexOf(shape);
        shapes.splice(index, 1);
        
        particleSystem.updateSetting('shapes', shapes);
    });
}

// Create DOM elements for each shape
settings.shapes.forEach((shape, index) => {
    addDOMShape(shape, index, true, fieldsByID['shapes']);
})




/* ----------------------------------- */
/* -- Resetting the Particle System -- */
/* ----------------------------------- */

const psReset = document.getElementById('resetParticleSystem');
psReset.addEventListener('click', (event) => {
    event.preventDefault();

    /* ----- Colors ----- */

    // Remove Existing color inputs from the DOM
    for (let i = colors.length - 1; i >= 0; i--) {
        removeDOMColor(i);
        colors.pop();
    }

    // Re-Add color inputs to the DOM
    settings.colors.forEach((color, index) => {
        addDOMColor(color, 'color' + index.toString(), fieldsByID['colors']);
    })

    // Reset the colors array
    colors = [...settings.colors];

    /* ----- Shapes ----- */
    shapes = [...settings.shapes];

    // Resets all DOM checkboxes for the shapes to checked.
    const useShapes = fieldsByID['shapes'].getElementsByTagName('input');
    for (let i = 0; i < useShapes.length; i++) {
        useShapes[i].checked = settings.shapes.includes(useShapes[i].id);
    }

    /* ----- Other Values ----- */
    for (const [key, value] of Object.entries(settings)) {

        // Resets the respective number for each range input
        const options = {
            isPercent: key === 'fadeDist',
            isNumber: key !== 'forceUnitSize'
        }
        updateDOMValue(DOMValuesByID, key, value, options);

        // Resets the Input values of each respective DOM element
        const input = inputsByID[key];
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
                continue;
            }
            input.value = value;
        }
    }

    // Reset the particle system back to default.
    particleSystem.updateAllSettings(settings);
})