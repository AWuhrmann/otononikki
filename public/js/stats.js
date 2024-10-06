statsButtons = []

// Interaction functions for different types
const interactionHandlers = {
    counter: function(buttonElement) {
      let count = parseInt(buttonElement.getElementsByClassName('count-text')[0].innerHTML) || 0;
      count++;
      buttonElement.getElementsByClassName('count-text')[0].innerHTML = count;
      sendInteractionData(buttonElement.id, 'counter', count)
      console.log(`Counter incremented for button ${buttonElement.id}`);
    },
    
    level: function(buttonElement) {
        const levelText = buttonElement.getElementsByClassName('level-text')[0];
        let currentLevel = parseInt(levelText.innerHTML);
        const max = parseInt(buttonElement.getAttribute('data-max')) || 10;
        currentLevel = currentLevel < max ? currentLevel + 1 : buttonElement.getAttribute('data-min');
        levelText.innerHTML = currentLevel;
        sendInteractionData(buttonElement.id, 'level', currentLevel)
      console.log(`Level updated for button ${buttonElement.id}`);
    },
    
    // You can add more types as needed, like 'toggle', 'slider', etc.
  };
  

document.addEventListener('DOMContentLoaded', function() {

    statsButtons = document.querySelectorAll('.button-stats')

    var buttonConfigs = [];

    statsButtons.forEach(button => {
        const buttonId = button.id;
        const interactionType = button.getAttribute('data-type');
        
        if (interactionType in interactionHandlers) {
            registerButton(buttonId, interactionType, interactionHandlers[interactionType]);
        } else {
          console.warn(`No interaction handler found for button type: ${interactionType}`);
        }
      });
    
});

const buttonRegistry = new Map();

// Register a new button to the map
function registerButton(buttonId, interactionType, interactionFunction) {
    buttonRegistry.set(buttonId, {
      interactionType,
      interactionFunction
    });
  }

document.addEventListener('click', function(event) {
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
    }).then(response => response.text())
      .then(data => console.log('Data sent to server:', data))
      .catch(error => console.error('Error sending data:', error));
  }