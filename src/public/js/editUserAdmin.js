async function loadUsers() {

    // Obtenemos los datos del usuario: 
    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });

    // Si falla la validación del token:
    if (sessionResponse.redirected) {
        let invalidTokenURL = sessionResponse.url;
        window.location.replace(invalidTokenURL);
    };

    // Pasamos la respuesta a json:
    const sessionRes = await sessionResponse.json();

    // Si no se cumplen con los permisos para acceder a la ruta: 
    if (sessionRes.statusCode === 401) {

        Swal.fire({
            title: sessionRes.h1,
            text: sessionRes.message,
            imageUrl: sessionRes.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: sessionRes.h1,
        });

    } else {

        // Obtenemos el carrito del usuario: 
        const usersResponse = await fetch(`/api/users/getAllUsers`, {
            method: 'GET',
        });

        // Si falla la validación del token:
        if (usersResponse.redirected) {
            const invalidTokenURL = usersResponse.url;
            window.location.replace(invalidTokenURL);
        };

        // Pasamos a la respuesta a json: 
        const usersRes = await usersResponse.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (usersRes.statusCode === 401) {

            Swal.fire({
                title: usersRes.h1,
                text: usersRes.message,
                imageUrl: usersRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: usersRes.h1,
            });

        } else {

            // Si se pudo acceder a la ruta, entonces extraemos la info necesaria:
            const statusCodeRes = usersRes.statusCode;
            const messageRes = usersRes.message;
            const customError = usersRes.cause;
            const resultUsers = usersRes.result;

            if (statusCodeRes === 200) {
                tableUsers(resultUsers);
            } else if (customError || statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al obtener los usuarios',
                    text: customError || messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al obtener los usuarios',
                    text: messageRes
                });
            }

        };

    };

};

loadUsers();

async function tableUsers(resultUsers) {

    console.log(resultUsers)

    const yoursUsersTable = document.getElementById("tableUsers")

    yoursUsersTable.innerHTML = ""

    resultUsers.forEach((user) => {

        const usersRow = `
            <tr>
                <td>${user.first_name}</td>

                <td>${user.email}</td>

                <td>${user._id}</td>

                <td>${user.role}</td>

                <td>${user.last_connection}</td>

                <td>
                    <img style="width: 3em;" class="botonD papelera-icon" id="edit-${user._id}" 
                    src="https://i.ibb.co/VVTLhfG/user-role-removebg-preview.png" alt="user-role-removebg-preview" border="0">
                </td>

                <td>
                    <img style="width: 3em;" class="botonD papelera-icon" id="delete-${user._id}"
                    <img src="https://i.ibb.co/tDDS3mQ/2885560-200-removebg-preview.png" alt="deleteUser" border="0">
                </td>

            </tr>`;

        yoursUsersTable.insertAdjacentHTML('beforeend', usersRow);

    });

    resultUsers.forEach((user) => {

        const editBtn = document.getElementById(`edit-${user._id}`);
        const deleteBtn = document.getElementById(`delete-${user._id}`);

        editBtn.addEventListener("click", () => {
            editUser(user._id);
        });

        deleteBtn.addEventListener("click", () => {
            deleteUser(user._id);
        });

    })

};



async function editUser(uid){
    console.log(uid)
}


async function deleteUser(uid){
    console.log(uid)
}









// Ocultar la vista de carga después de 1 segundo (1000 milisegundos):
const carga = document.getElementById("VistaDeCarga");
const vista = document.getElementById("contenedorVista");

function pantallaCarga() {
    setTimeout(() => {
        carga.style = "display: none";
        vista.style = "display: block";
    }, 1000);
};
pantallaCarga();