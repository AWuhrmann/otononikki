// login.js

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', function(event) {

    event.preventDefault(); // Prevent the default form submission
    const username = 'admin';
    const password = document.getElementById('password').value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    })
    .then(response => {
      console.log(response);
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      if (data.accessToken) {
        localStorage.setItem('jwtToken', data.accessToken);
        window.location.href = 'index.html'; // Redirect to main website
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error:', error));
  });
});