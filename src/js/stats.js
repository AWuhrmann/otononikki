statsButtons = []

const updateHandlers = {
    counter: function(buttonElement, value) {
        const countText = buttonElement.getElementsByClassName('count-text')[0];
        countText.innerHTML = value;
        console.log(`Counter value set to ${value} for button ${buttonElement.id}`);
    },
    
    level: function(buttonElement, value) {
      const levelText = buttonElement.getElementsByClassName('level-text')[0];
      levelText.innerHTML = value;
      console.log(`Level value set to ${value} for button ${buttonElement.id}`);
    },
    
    // You can add more setValue handlers as needed, like 'toggle', 'slider', etc.
  };

// Interaction functions for different types
const interactionHandlers = {
    counter: function(buttonElement) {
      let count = parseInt(buttonElement.getElementsByClassName('count-text')[0].innerHTML) || 0;
      count++;
      buttonRegistry.get(buttonElement.id).updateFunction(buttonElement, count);
      sendInteractionData(buttonElement.id, 'counter', count);
    },
    
    level: function(buttonElement) {
        const levelText = buttonElement.getElementsByClassName('level-text')[0];
        let currentLevel = parseInt(levelText.innerHTML);
        const max = parseInt(buttonElement.getAttribute('data-max')) || 10;
        currentLevel = currentLevel < max ? currentLevel + 1 : buttonElement.getAttribute('data-min');
        buttonRegistry.get(buttonElement.id).updateFunction(buttonElement, currentLevel);
        sendInteractionData(buttonElement.id, 'level', currentLevel);
    },
    
    // You can add more types as needed, like 'toggle', 'slider', etc.
  };
  

document.addEventListener('DOMContentLoaded', function() {

    statsButtons = document.querySelectorAll('.button-stats')

    var buttonConfigs = [];

    statsButtons.forEach(button => {
        updateID(button);

        const buttonId = button.id;
        const interactionType = button.getAttribute('data-type');
        
        if ((interactionType in interactionHandlers)) {
            registerButton(buttonId, interactionType, interactionHandlers[interactionType], updateHandlers[interactionType]);
            fetch('/api/stats/get-specific-stat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({buttonId: buttonId, interactionType: interactionType})
            })
            .then(response => response.json())
            .then(data => { 
                for(key in data){
                    buttonRegistry.get(key).updateFunction(button, data[key]['data'])
                }
            });
        } else {
          console.warn(`No interaction handler found for button type: ${interactionType}`);
        }
      });
      console.log(buttonRegistry);
    
});

const buttonRegistry = new Map();

// Register a new button to the map
function registerButton(buttonId, interactionType, interactionFunction, updateFunction) {
    buttonRegistry.set(buttonId, {
      interactionType,
      interactionFunction,
      updateFunction
    });

  }

function updateID(buttonElement){
    buttonElement.getElementsByClassName('id-header')[0].innerHTML = buttonElement.id;
}

document.addEventListener('click', function(event) {
    event.preventDefault();
    const buttonElement = event.target.closest('.button-stats');

    if (buttonElement) {
        const buttonId = buttonElement.id;
        const buttonInfo = buttonRegistry.get(buttonId);
        
        if (buttonInfo && buttonInfo.interactionFunction) {
        buttonInfo.interactionFunction(buttonElement);
        } else {
        console.warn(`No interaction function found for button: ${buttonId}`);
        }
    }
});

function sendInteractionData(buttonId, interactionType, interactionValue) {
    fetch('/api/stats/add-stat', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        button_id: buttonId,
        interaction_type: interactionType,
        interaction_value: interactionValue,
        interaction_timestamp: new Date().toISOString()
        })
    })
    .then(response => response.text())
    .then(data => console.log('Data sent to server:', data))
    .catch(error => {
        console.error('Error sending data:', error);
        // Optionally display an error message to the user
    });
    }      

