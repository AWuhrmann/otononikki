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

        mediaRecorder.onstop = async() => {

            const selectedContactsStr = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                .map(input => `[[${input.value}]]`).join(', ');
            console.log("Recorded voice !");
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg-3' }); // Ensure the MIME type matches your file format
            const formData = new FormData();
            formData.append('audioFile', audioBlob, 'audio.mp3'); // 'audioFile' matches the name expected by Multer in your backend
            formData.append('contacts', selectedContactsStr);
            fetch('/transcribe', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const { transcription } = data;
                    transcriptBox.value = transcription;
                    // Use the transcription and content as needed
                })
                .catch(error => console.error('Error:', error));

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
                fuse = new Fuse(allContacts, options);
            })
            .catch(error => {
                console.error('Error fetching contacts:', error);
            });
    }

    // Keep information about the contacts selected, so that when I filter them it doesnt go away.
    const selectedContacts = {};

    function displayContacts(contacts) {
        const container = document.getElementById('checkbox-list');
        container.innerHTML = ''; // Clear existing content
        contacts.forEach((contact, index) => {
            const label = document.createElement('label');
            label.className = 'card';
            label.innerHTML = `
            <input class="card__input" type="checkbox" name="option${index + 1}" value="${contact.name}" id="contact-${contact.name}" ${selectedContacts[contact.name] ? 'checked' : ''}/>
            <div class="card__body">
                <header class="card__body-header">
                    <h2 class="card__body-header-title">${contact.name}</h2>
                    <p class="card__body-header-subtitle">${contact.name}</p>
                </header>
                <div class="card__body-cover"><img class="card__body-cover-image" src="${contact.picture ? contact.picture : '/contacts/pictures/default.png'}"/>
                    <span class="card__body-cover-checkbox"> 
                        <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </svg>
                    </span>
                </div>
            </div>
        `;
            const input = label.querySelector('input');
            input.addEventListener('change', () => {
                if (input.checked) {
                    selectedContacts[contact.name] = true;
                } else {
                    delete selectedContacts[contact.name];
                }
                updateTags();
            });

            container.appendChild(label);
        });
    }
    // Returns the first contact of the list of contacts, taking into account the search (if M is written, its the first element starting with M...)
    function getFirstContactInList() {
        const container = document.getElementById('checkbox-list');
        return container.firstChild;
    }

    // To have the nice contacts selected in the search bar :)

    const tag_list = document.getElementById("tag-list");
    input_tag = tag_list.querySelector("input");

    // Variables to keep track of selected tag for deletion
    let lastTagSelected = false;

    // Event listener for keyup events in the input field
    input_tag.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') {
            addTagToSearch(getFirstContactInList().querySelector('input'));
        } else if (e.key === 'Backspace') {
            handleBackspace();
        } else {
            lastTagSelected = false; // Reset if other keys are pressed
        }
    });

    // Function to handle the addition of tags
    function addTagToSearch(element) {
        console.log(element);
        element.checked = true;
        const event = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(event);
        updateTags();
        input_tag.value = '';
        filterContacts();
        searchBox.focus();
    }

    // Function to handle backspace key
    function handleBackspace() {
        if (input_tag.value === '' && !lastTagSelected) {
            selectLastTag();
        } else if (input_tag.value === '' && lastTagSelected) {
            deleteLastTag();
        }
    }

    // Function to select the last tag
    function selectLastTag() {
        const tagItems = tag_list.querySelectorAll('li:not(:last-child)');
        if (tagItems.length > 0) {
            const lastTag = tagItems[tagItems.length - 1];
            lastTag.classList.add('selected-tag');
            lastTagSelected = true;
        }
    }

    // Function to delete the last tag
    function deleteLastTag() {
        const tagItems = tag_list.querySelectorAll('li:not(:last-child)');
        if (tagItems.length > 0) {
            const lastTag = tagItems[tagItems.length - 1];
            const contactName = lastTag.textContent.trim();
            removeTag(contactName);
            lastTagSelected = false;
        }
    }

    // Updates the UI of the tags when an element is added to the selectedContacts
    function updateTags() {
        const tagItems = tag_list.querySelectorAll('li:not(:last-child)');
        tagItems.forEach(tag => tag.remove());

        let liTag = '';
        Object.keys(selectedContacts).forEach((contactName) => {
            liTag += `<li>${contactName}<i class="fa fa-times"></i></li>`;
        });
        tag_list.insertAdjacentHTML('afterbegin', liTag);

        const deleteIcons = tag_list.querySelectorAll('.fa-times');
        deleteIcons.forEach(icon => {
            const contactName = icon.parentElement.textContent.trim();
            icon.addEventListener('click', () => removeTag(contactName));
        });
    }

    // Removes a tag from the search
    function removeTag(tag) {
        const element = document.getElementById(`contact-${tag}`);
        element.checked = false;

        const event = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(event);

        delete selectedContacts[tag];
        updateTags();
        searchBox.focus();
    }

    // update the list of contacts depending on the search
    function filterContacts() {
        const searchText = searchBox.value.toLowerCase();
        if (searchText.trim() == '') {
            displayContacts(allContacts);
        } else {
            const results = fuse.search(searchText); // fuse allows for fuzzy search, more soft :)
            const filteredContacts = results.map(result => result.item);
            displayContacts(filteredContacts);
        }
    }

    window.filterContacts = filterContacts; // Make the function globally available for the HTML input's event

    window.addContact = function() {

        const regex = /\[\[(.*?)\]\]/;
        const match = transcriptBox.value.match(regex);
        return;
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

    // Fuzzy search init
    const options = {
        includeScore: true,
        keys: ['name']
    };
    let fuse;

    // Transcript box and menu actions

    window.onClickUploadButton = function() {
        console.log(transcriptBox.value);

        const selectedContactsStr = Object.keys(selectedContacts)
            .map(contact => `[[${contact}]]`)
            .join(', ');
        console.log(selectedContactsStr);

        const transcriptionData = {
            translation: transcriptBox.value, // content received from the transcription endpoint
            contacts: selectedContactsStr,
            date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        };

        fetch('/uploadTranscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transcriptionData)
            })
            .then(response => response.text())
            .then(data => console.log('Upload response:', data))
            .catch(error => console.error('Error:', error));
    }
});

// This could be in a login form submit handler
async function handleLogin(username, password) {
    const response = await fetch('https://your-api.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      // Store the token securely
      localStorage.setItem('authToken', data.token);
    }
  }

// This function can be used for all your API requests
async function apiRequest(url, method = 'GET', body = null) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
}

function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      window.location.href = 'login.html'; // Redirect to login if no token
    } else {
      fetch('/verifyToken', { // Optional: Verify token with server
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        localStorage.removeItem('jwtToken'); // Remove invalid token
        window.location.href = 'login.html'; // Redirect to login
      });
    }
  }
  
// Call checkAuth on page load
document.addEventListener('DOMContentLoaded', checkAuth);
  

function fetchProtectedData() {
    const token = localStorage.getItem('jwtToken');
  
    if (!token) {
      alert('No token found, please login first');
      return;
    }
  
    fetch('/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      if (response.status === 200) {
        return response.text();
      } else {
        throw new Error('Access denied');
      }
    })
    .then(data => {
      console.log('Protected data:', data);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Access denied');
    });
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