document.addEventListener('DOMContentLoaded', function() {

    statsButtons = document.getElementsByClassName('button-stats')

    for (let el of statsButtons) {
        const buttonType = el.getAttribute('data-type');

        // Initialize the right button type based on 'data-type' attribute
        if (buttonType === 'counter') {
            initCounterButton(el);
        } else if (buttonType === 'level') {
            initLevelButton(el);
        }
    }
});

function initCounterButton(el) {
    el.addEventListener('click', function() { onClickCounterButton(el); });
}

function initLevelButton(el) {
    el.addEventListener('click', function() { onClickLevelButton(el); });
}

// Functionality for the Counter Button
function onClickCounterButton(el) {
    const counter = el.getElementsByClassName('count-text')[0];

    // Get and update the counter value
    let currentCount = parseInt(counter.innerHTML) || 0;
    currentCount++;
    counter.innerHTML = currentCount;
}

// Functionality for the Level Button
function onClickLevelButton(el) {
    const parent = el.getElementsByClassName('stats-interactive-div')[0];
    const levelText = parent.getElementsByClassName('level-text')[0];

    console.log(parent);
    console.log(parent.getElementsByClassName('level-text'));

    // Get min and max levels from data attributes
    const min = parseInt(el.getAttribute('data-min')) || 1;
    const max = parseInt(el.getAttribute('data-max')) || 10;
    
    // Get and update the current level
    let currentLevel = parseInt(levelText.innerHTML) || min;
    currentLevel = currentLevel < max ? currentLevel + 1 : min;
    levelText.innerHTML = currentLevel;
}
