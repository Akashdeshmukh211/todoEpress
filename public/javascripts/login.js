$(document).ready(function () {
    $("#login").validate({
        rules: {
            Username: {
                required: true
            },
            password: {
                required: true,
            }
        },
        messages: {
            Username: {
                required: "Please enter your username"
            },
            password: {
                required: "Please enter your password",
            }
        },

        submitHandler: function (form) {
            loginUser()
        }
    }); $("#register").validate({
        rules: {
            fullname: {
                required: true
            },
            username: {
                required: true,
            },
            email: {
                required: true
            },
            password: {
                required: true,
            }
        },
        messages: {
            fullname: {
                required: "Please enter your fullname"
            },
            username: {
                required: "Please enter your username",
            },
            email: {
                required: "Please enter your email",
            },
            password: {
                required: "Please enter your password",
            }
        },

        submitHandler: function (form) {
            $('#creatAccount').attr('disabled', true);

            userCreat()
        }
    });

});

function userCreat() {
    let user = {};
    user.name = document.getElementById('fullname').value;
    user.username = document.getElementById('Username').value;
    user.password = document.getElementById('password').value;
    user.email = document.getElementById('email').value;
    fetch('http://localhost:3000/registerUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            return response.json();
        })
        .then(data => {
            if (data.success === true) {
                toastr.success('User Created Please Wait...');
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            }
        })
        .catch(error => {
            toastr.error('Something Went Wrong');
            console.error('Error:', error);
            setTimeout(() => {
                // window.location.href = "/";
            }, 4000);
        });
}


function loginUser() {
    // document.getElementById('creatAccount').removeAttribute('disabled');
    let user = {};
    user.username = document.getElementById('Username').value;
    user.password = document.getElementById('password').value;
    fetch('http://localhost:3000/loginUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to login');
            }
            return response.json();
        })
        .then(data => {
            if (data.success === true) {
                toastr.success('Login Successful Please Wait...');
                localStorage.setItem('token', data.token); // Store the JWT token in localStorage
                localStorage.setItem('username', data.name); // Store the user name
                localStorage.setItem('userAccess', data.userAccess); // Store the user name
                setTimeout(() => {
                    window.location.href = "/index";
                }, 2000);
            }
        })
        .catch(error => {
            toastr.error('Please Check Username and Password');
            console.error('Error:', error);
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        });
}
