const Renderer = {
    ctx: null,
    canvas: null,
    initRenderer: () => {
        canvas = document.querySelector('#bg-canvas');

    if (!canvas.getContext || !canvas) return;

    window.addEventListener('resize', onResize);

    onResize();

    initParticles();

    ctx = canvas.getContext('2d');
    }
}