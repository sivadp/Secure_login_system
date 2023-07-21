function generateUsername() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers='0123456789'
    let username = '';
    for (let i = 0; i < 5; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    for(let i=0;i<3;i++){
        username +=numbers.charAt(Math.floor(Math.random()*numbers.length))
    }
    document.getElementById('username').value=username;
}
function showPassword() {
    let password = document.getElementById("password");
    if (password.type === "password") {
       password.type = "text";
   } else {
        password.type = "password";
    }
   }
const message = new URLSearchParams(window.location.search).get('message');
if(message){
   alert(message);
}
