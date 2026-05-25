// Hide register block when logged in
window.addEventListener('DOMContentLoaded', function() {
    const userSession = localStorage.getItem('userSession');
    const registerBlock = document.getElementById('registerBlock');
    if (userSession && registerBlock) {
        registerBlock.style.display = 'none';
    } else if (registerBlock) {
        registerBlock.style.display = '';
    }
});
