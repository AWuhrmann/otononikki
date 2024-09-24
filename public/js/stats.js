document.addEventListener('DOMContentLoaded', function() {

    const statsButtons = document.getElementsByClassName('button-stats');

    for(let el of statsButtons){
        el.addEventListener('click', function() {
            console.log('hii');
        });
    }
});