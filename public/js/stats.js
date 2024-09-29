document.addEventListener('DOMContentLoaded', function() {

    const statsButtons = document.getElementsByClassName('button-stats');

    for(let el of statsButtons){
        el.addEventListener('click', function() {onClickStatsButton(el)});
    }
});

function onClickStatsButton(el){
    const counter = el.getElementsByClassName('count-text')[0];
    
    // Get the current count, if empty or NaN, start with 0
    let currentCount = parseInt(counter.innerHTML) || 0;

    // Increment the count
    currentCount++;

    // Update the counter text
    counter.innerHTML = currentCount;
}