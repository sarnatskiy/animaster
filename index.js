addListeners();

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });
    
    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().fadeOut(block, 5000);
        });        

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    let currentMoveAndHide;
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            currentMoveAndHide = animaster().moveAndHide(block, 1000);
        });

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (currentMoveAndHide) {
                currentMoveAndHide.reset();
            }
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 1000);
        });

    let currentHeartBeating;
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            currentHeartBeating = animaster().heartBeating(block);
        });
    
    document.getElementById('heartBeatingStop')
      .addEventListener('click', function () {
            if (currentHeartBeating) {
                currentHeartBeating.stop();
            }
        });

    const shakingAnimationHandler = animaster()
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .buildHandler();

    const shakingBlock = document.getElementById('shakingAnimationBlock');
    if (shakingBlock) {
        shakingBlock.addEventListener('click', shakingAnimationHandler);
    }
}

function animaster() {
    function resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    return {
        _steps: [],

        addMove(duration, translation) {
            this._steps.push({ name: 'move', duration, translation });
            return this;
        },

        addScale(duration, ratio) {
            this._steps.push({ name: 'scale', duration, ratio });
            return this;
        },

        addFadeIn(duration) {
            this._steps.push({ name: 'fadeIn', duration });
            return this;
        },

        addFadeOut(duration) {
            this._steps.push({ name: 'fadeOut', duration });
            return this;
        },

        addDelay(duration) {
            this._steps.push({ name: 'delay', duration });
            return this;
        },

        play(element, cycled = false) {
            let stopRequested = false;
            let timeouts = [];
            const steps = this._steps;

            function perform() {
                if (stopRequested) 
                    return;
                let delay = 0;
                for (const step of steps) {
                    let t = setTimeout(() => {
                        if (stopRequested)
                            return;
                        switch (step.name) {
                            case "move":
                                element.style.transitionDuration = `${step.duration}ms`;
                                element.style.transform = getTransform(step.translation, null);
                                break;
                            case  "scale":
                                element.style.transitionDuration = `${step.duration}ms`;
                                element.style.transform = getTransform(null, step.ratio);
                                break;
                            case "fadeIn":
                                element.style.transitionDuration = `${step.duration}ms`;
                                element.classList.remove('hide');
                                element.classList.add('show');
                                break;
                            case "fadeOut":
                                element.style.transitionDuration = `${step.duration}ms`;
                                element.classList.remove('show');
                                element.classList.add('hide');
                                break;

                        }
                    }, delay);
                    timeouts.push(t);
                    delay += step.duration;
                }

                if (cycled) {
                    let cycleTimer = setTimeout(perform, delay);
                    timeouts.push(cycleTimer);
                }
            }

            perform();

            return {
                stop() {
                    stopRequested = true;
                    timeouts.forEach(clearTimeout);
                },
                reset() {
                    stopRequested = true;
                    timeouts.forEach(clearTimeout);
                    resetMoveAndScale(element);
                    for (const step of steps) {
                        if (step.name === 'fadeIn') 
                            resetFadeIn(element);
                        if (step.name === 'fadeOut') 
                            resetFadeOut(element);z
                    }
                }
            };
        },

        buildHandler() {
            const anim = this;
            return function() {
                anim.play(this);
            };
        },

        move(element, duration, translation) {
            return this.addMove(duration, translation).play(element);
        },

        scale(element, duration, ratio) {
            return this.addScale(duration, ratio).play(element);
        },

        fadeIn(element, duration) {
            return this.addFadeIn(duration).play(element);
        },

        fadeOut(element, duration) {
            return this.addFadeOut(duration).play(element);
        },

        moveAndHide(element, duration) {
            return this.addMove(duration * (2/5), { x: 100, y: 20 })
                       .addFadeOut(duration * (3/5))
                       .play(element);
        },

        showAndHide(element, duration) {
            return this.addFadeIn(duration * (1/3))
                       .addDelay(duration * (1/3))
                       .addFadeOut(duration * (1/3))
                       .play(element);
        },

        heartBeating(element) {
            return this.addScale(500, 1.4)
                       .addScale(500, 1)
                       .play(element, true);
        }
    };
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}