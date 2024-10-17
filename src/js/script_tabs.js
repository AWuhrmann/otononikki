document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  // Check localStorage for the active tab
  const activeTab = localStorage.getItem('activeTab') || tabs[0].getAttribute('data-tab');  // Default to the first tab

  // Function to activate a tab
  function activateTab(tabId) {
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      }
    });

    contents.forEach(content => {
      content.style.display = content.id === tabId ? 'block' : 'none';
    });
  }

  // Activate the tab based on localStorage or default to first tab
  activateTab(activeTab);

  // Add event listener for tab clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      activateTab(target);

      // Save the active tab to localStorage
      localStorage.setItem('activeTab', target);
    });
  });
});


