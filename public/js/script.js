document.addEventListener('DOMContentLoaded', function() {
    const recordButton = document.getElementById('recordButton');
    const recordIcon = recordButton.querySelector('i');
    const transcriptBox = document.getElementById('transcriptBox');
    let mediaRecorder;
    let audioChunks = [];

    // Check if the browser supports the MediaRecorder API
    if (typeof MediaRecorder === "undefined") {
        alert("Your browser does not support the MediaRecorder API. Try updating or switching your browser.");
        return;
    }

    async function startRecording() {
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(event) {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {

            const selectedContacts = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                              .map(input => `[[${input.value}]]`).join(', ');
            console.log("Recorded voice !");
            const audioBlob = new Blob(audioChunks, {type: 'audio/mpeg-3'}); // Ensure the MIME type matches your file format
            const formData = new FormData();
            formData.append('audioFile', audioBlob, 'audio.mp3'); // 'audioFile' matches the name expected by Multer in your backend
            formData.append('contacts', selectedContacts);
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData, // Send the FormData object containing the audio file
                });
                const text = await response.text(); // Assuming the response is just text
                transcriptBox.value = text; // Display the transcription result in your transcript box
            } catch (error) {
                console.error('Upload failed:', error);
                transcriptBox.value = "Failed to upload and transcribe audio.";
            }
        };
    
        mediaRecorder.start();
    }

    let isRecording = false;
    recordButton.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
            isRecording = true;
            recordIcon.classList.remove('fa-circle-o');
            recordIcon.classList.add('fa-dot-circle-o');
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordIcon.classList.remove('fa-dot-circle-o');
            recordIcon.classList.add('fa-circle-o');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('search-box');
let allContacts = []; // Store all contacts

function fetchContacts() {
    fetch('/contacts')
        .then(response => response.json())
        .then(data => {
            allContacts = data; // Store the fetched data
            displayContacts(data); // Display all contacts initially
        })
        .catch(error => {
            console.error('Error fetching contacts:', error);
        });
}

function displayContacts(contacts) {
    const container = document.getElementById('checkbox-list');
    container.innerHTML = ''; // Clear existing content
    contacts.forEach((contact, index) => {
        const label = document.createElement('label');
        label.className = 'card';
        label.innerHTML = `
            <input class="card__input" type="checkbox" name="option${index + 1}" value="${contact.name}" id="contact-${contact.name}"/>
            <div class="card__body">
                <header class="card__body-header">
                    <h2 class="card__body-header-title">${contact.name}</h2>
                    <p class="card__body-header-subtitle">${contact.name}</p>
                </header>
                <div class="card__body-cover"><img class="card__body-cover-image" src="${contact.picture ? contact.picture : 'https://i.ibb.co/0F3SdsX/category-t.png'}"/>
                    <span class="card__body-cover-checkbox"> 
                        <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </svg>
                    </span>
                </div>
            </div>
        `;
        container.appendChild(label);
    });
}

function filterContacts() {
    const searchText = searchBox.value.toLowerCase();
    const filteredContacts = allContacts.filter(contact => contact.name.toLowerCase().includes(searchText));
    displayContacts(filteredContacts);
}

window.filterContacts = filterContacts; // Make the function globally available for the HTML input's event

window.addContact = function() {
    transcriptBox.value = "hmm";
    console.log("ahhh");
    const name = document.getElementById('new-contact-name').value;
    if (!name) {
        alert('Please enter a name.');
        return;
    }
    fetch('/add-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Contact added successfully!');
            fetchContacts(); // Refresh the contact list
        } else {
            alert('Failed to add contact.');
        }
    })
    .catch(error => {
        console.error('Error adding contact:', error);
        alert('Failed to add contact.');
    });
};


fetchContacts();
});

 function myFunction2() {
    // Code JavaScript pour le bouton rouge
    alert('Bouton rouge cliqué!');
 }
 
 // Function to update the date in the header
 function updateDate() {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const fullDate = `${dayName} ${day} ${month}`;
    document.getElementById('current-date').textContent = fullDate;
  }
 
  // Call updateDate on page load
  updateDate();
 