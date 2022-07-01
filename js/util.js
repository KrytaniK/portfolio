function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomValue(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function clamp(num, min, max) {
    return Math.min(max, Math.max(num, min));
}

// Particle System takes in a settings object
/*
    {
        count: 100,
        colors: ['#DA0037', '#444', '#00DACD'],
        shapes: ['Rectangle', 'Circle', 'Triangle'],
        min_speed: .005,
        max_speed: .1,
        min_size: 3,
        max_size: 7,
        forceUnitSize: false,
        fadeInDist: .5
    }
*/
// Each Item in this object has a representation on-screen.

// The only special case is the array, which will need a way to display each element