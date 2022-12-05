let user = JSON.parse(sessionStorage.getItem('user'))

if (user) {
    document.getElementById('welcomemessage').innerText = `Welcome ${user.username}!`
    //set navigation data
    //fill in username
    //load in user specific data: favorites, pictures, etc....
} else {
    window.location.href = "/frontend/login.html"
}