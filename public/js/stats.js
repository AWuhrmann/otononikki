document.addEventListener('DOMContentLoaded', function() {

    const statsButtons = document.getElementsByClassName('button-stats');

    for(let el of statsButtons){
        el.addEventListener('click', function() {onClickStatsButton(el)});
    }
});

function onClickStatsButton(el){
    console.log(el);
    const counter = el.getElementsByClassName('count-text')[0];
    console.log(counter);
    counter.innerHTML = 'a';
}