

axios.defaults.headers.common['X-Auth-Token'] =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';


function postSignup() {
    axios.put('http://localhost:8080/signup')
        .then(res => console.log(res))
        .catch(err => console.log(err))
};

function getLogin() {};

function getMessages() {};

function postMessage() {};

function comment() {};

function deleteMessage() {};




//Event Listeners
document.getElementById('login-btn').addEventListener('click', getLogin);
document.getElementById('signup-btn').addEventListener('click', postSignup);