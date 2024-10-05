statsButtons = []

document.addEventListener('DOMContentLoaded', function() {

    statsButtons = document.getElementsByClassName('button-stats')

    var buttonConfigs = [];

    for (let el of statsButtons) {
        const buttonType = el.getAttribute('data-type');

        // Initialize the right button type based on 'data-type' attribute
        if (buttonType === 'counter') {
            initCounterButton(el);
        } else if (buttonType === 'level') {
            initLevelButton(el);
        }
        buttonConfigs.push({buttonId: el.id, interactionType: buttonType});
    }
    

        fetch('/api/stats/get-specific-stat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({buttonConfigs})
        })
        .then(response => response.json())
        .then(data => {
            for(key in data){
                el = ([].slice.call(statsButtons).find((el) => el.id == key))
                if(data[key]['interactionType'] == 'counter'){
                    updateCounter(el, data[key]['data'])
                } else if (data[key]['interactionType'] == 'level') {
                    updateLevel(el, data[key]['data'])
                }
            }
        })
        .catch(error => console.error('Error:', error));
});

function initCounterButton(el) {
    el.addEventListener('click', function() { onClickCounterButton(el); });
}

function initLevelButton(el) {
    el.addEventListener('click', function() { onClickLevelButton(el); });
}

function updateElement(el, value){
    
}

function updateCounter(el, value){
    const counter = el.getElementsByClassName('count-text')[0];
    counter.innerHTML = value;

}

function updateLevel(el, value){ // to finish
    const parent = el.getElementsByClassName('stats-interactive-div')[0];
    const levelText = parent.getElementsByClassName('level-text')[0];

    const min = parseInt(el.getAttribute('data-min')) || 1;
    const max = parseInt(el.getAttribute('data-max')) || 10;
    
    value = value < max ? value + 1 : min;
    levelText.innerHTML = value;
}

// Functionality for the Counter Button
function onClickCounterButton(el) {
    const counter = el.getElementsByClassName('count-text')[0];

    // Get and update the counter value
    let currentCount = parseInt(counter.innerHTML) || 0;
    currentCount++;
    
    updateCounter(el, currentCount);

    const interactionData = {
        button_id: el.id,
        interaction_type: 'counter',
        interaction_value: 1,
        interaction_timestamp: new Date().toISOString()
    };


    fetch('/api/stats/add-stat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(interactionData)
    })
    .then(response => response.text())
    .then(data => console.log('Upload response:', data))
    .catch(error => console.error('Error:', error));

    fetch('/api/stats/get-all-stats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => console.log('Upload response:', data))
    .catch(error => console.error('Error:', error));


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
    let value = parseInt(levelText.innerHTML) || min;
    value = value < max ? value + 1 : min;
    levelText.innerHTML = value;

    const interactionData = {
        button_id: el.id,
        interaction_type: 'level',
        interaction_value: value,
        interaction_timestamp: new Date().toISOString()
    };


    fetch('/api/stats/add-stat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(interactionData)
    })
    .then(response => response.text())
    .then(data => console.log('Upload response:', data))
    .catch(error => console.error('Error:', error));

    fetch('/api/stats/get-all-stats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => console.log('Upload response:', data))
    .catch(error => console.error('Error:', error));

}
