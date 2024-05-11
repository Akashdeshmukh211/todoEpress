
$(document).ready(function () {
    $("#todoForm").validate({
        rules: {
            todo: {
                required: true
            },
        },
        messages: {
            todo: {
                required: "Please enter your todo"
            },
        },

        submitHandler: function (form) {
            $('#addtodobtn').attr('disabled', true);
            todoCreat()
        }
    });
    (async function checkAuth() {
        let res = await fetch('', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
        console.log(res)
        if (res.status == 401) {
            window.location.href = "/"
        }
    })()
});
let localData = localStorage.getItem('token')
let username = localStorage.getItem('username')
let user = document.getElementById('userName')
let login = document.getElementById('logout')
let todoForm = document.getElementById('todoForm')


if (localData === null) {
    user.classList.add("hidden");
    login.classList.add("hidden");
    todoForm.classList.add("hidden");
} else {
    user.innerText = `User Name - ` + username
}

function todoCreat() {
    document.getElementById('addtodobtn').removeAttribute('disabled');
    let todo = {};
    todo.todo = document.getElementById('todo').value;
    let todoId = document.getElementById('todoId').getAttribute('dataId');
    let pageValue = document.getElementById('todoId').getAttribute('pagevalue');
    if (todoId) {
        todo.id = todoId
    }
    fetch('http://localhost:3000/createTodo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(todo)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create todo');
            }
            return response.json();
        })
        .then(data => {
            if (data.success === true) {
                toastr.success(data.message);
                document.getElementById('todo').value = '';
                document.getElementById('todolistUl').innerHTML = '';
                document.getElementById('addtodobtn').textContent = 'Add Todo';
                getTodo(pageValue);
            }
        })
        .catch(error => {
            console.log(error)
            toastr.error('Something went wrong');
            console.error('Error:', error);
        });

}
async function getTodo(page = 1, limit = 5, user = username) {
    if (page == null) {
        page = 1
    }
    try {
        document.getElementById('todolistUl').innerHTML = '';
        document.getElementById('pages').innerHTML = '';
        document.getElementById('pagination').innerHTML = '';
        document.getElementById('addtodobtn').removeAttribute('disabled');

        let todo = {};
        todo.todo = document.getElementById('todo').value;

        const response = await fetch(`http://localhost:3000/getTodo?page=${page}&limit=${limit}&username=${user}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            // body: JSON.stringify(todo)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }

        const data = await response.json();

        if (data.success === true) {
            if (data.totalDocs == 0) {
                console.log(data.totalDocs)
                $(".todolist").hide()
                $('#checkTodo').empty()
                $('#checkTodo').show()
                $('#checkTodo').append(`<li class="list-group-item todoItemli">
                <p>No todos Available</p></li>`)
            } else {
                $(".todolist").show();
                $('#checkTodo').hide()
            }
            if (!data.userAccess) {
                $("#todoForm").hide()
            }
            data.data.forEach(listItem => {

                document.getElementById('todolistUl').insertAdjacentHTML('beforeend', `<li class="list-group-item todoItemli" id=${listItem._id}>
                <p>${listItem.todo}</p>
                <button type="button" class="btn ${listItem.todocompleted ? 'btn-secondary' : 'btn-primary'}" onclick="completeTodo('${listItem._id}','${data.page}')" >${listItem.todocompleted ? "Completed" : 'Not Completed'}</button>
                
                <button type="button" class="btn btn-danger ${data.userAccess ? '' : 'hidden'}" onclick="editTodo('${listItem._id}','${listItem.todo}','${data.page}')" >Edit</button>
                <button type="button" class="btn btn-danger  ${data.userAccess ? '' : 'hidden'}" onclick="deleteTodo('${listItem._id}','${data.page}')" >Delete</button></li>`);
            });

            for (let i = 1; i <= data.totalPages; i++) {
                document.getElementById('pages').insertAdjacentHTML('beforeend', `<li class="${page == i ? 'active' : ''}" onclick="getTodo('${i}')">${i}</li>`);
            }
            document.getElementById('pagination').insertAdjacentHTML('beforeend', `<button class="pbtn prev" onclick="getTodo('${data.page - 1}')" ${data.page == 1 ? 'disabled' : ''} >Previous</button>`);
            document.getElementById('pagination').insertAdjacentHTML('beforeend', `<button class="pbtn next" onclick="getTodo('${data.page + 1}')" ${data.page == data.totalPages ? 'disabled' : ''} > Next</button>`);
        }
    } catch (error) {
        console.error('Error:', error);
        if (!error.auth) {
            // toastr.error(error.message);
            document.getElementById('todolistUl').innerHTML = `<li class="list-group-item todoItemli">
            <p>Please Login <a href="/">Go to login page</a></p></li>`;
        }
    }
}


getTodo(page = 1, limit = 5)
function deleteTodo(id, page) {
    let todoDelete = {
        id: id
    };

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/deleteTodo/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                // body: JSON.stringify(todoDelete)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete todo");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success === true) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Your file has been deleted.",
                            icon: "success"
                        }).then(res => {
                            document.getElementById("todolistUl").innerHTML = "";
                            getTodo(page);
                        });
                    }
                })
                .catch(error => {
                    toastr.error("Something went wrong");
                    console.error("Error:", error);
                });
        }
    });
}


function completeTodo(id, page) {
    fetch(`http://localhost:3000/completeTodo/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to complete todo');
            }
            return response.json();
        })
        .then(data => {
            if (data.success === true) {
                toastr.success('Status Change');
                document.getElementById('todo').value = '';
                getTodo(page);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function editTodo(id, details, page) {
    document.getElementById('todoId').setAttribute('dataId', id);
    document.getElementById('todoId').setAttribute('pageValue', page);
    document.getElementById('todo').value = details;
    document.getElementById('addtodobtn').textContent = 'Update';
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userAccess");
    setTimeout(() => {
        window.location.href = "/"
    })
}