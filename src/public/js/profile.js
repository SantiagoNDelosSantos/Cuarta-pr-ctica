// Ocultar la vista de carga después de 1 segundo (1000 milisegundos):
const carga = document.getElementById("VistaDeCarga");
const vista = document.getElementById("contenedorVista");

function pantallaCarga() {
    setTimeout(() => {
        carga.style = "display: none";
        vista.style = "display: block";
    }, 1500);
};
pantallaCarga();

// Captura sección de Perfil:
const sectionPerfil = document.getElementById('sectionPerfil');

// Captura bóton de editar perfil:
const btnsEditarPerfil = document.getElementById('btnsEditarPerfil');

async function verPerfil() {

    const response = await fetch('/api/sessions/profile', {
        method: 'GET',
    })

    const res = await response.json();

    if (res) {

        // HTML para el cuadro de perfil:
        let htmlPerfil = "";

        htmlPerfil += `

        <div
        style="display: flex; justify-content: center; gap: 2em; flex-direction: row; align-items: center; margin: 0em 2em; ">

            <div style="display: flex; justify-content: center; gap: 0em; flex-direction: column; align-items: center; width: 80%; border-right: 0.1em solid #95d0f7; padding-right: 1.5em">

            <img src=${res.photo} alt="ADD-PHOTO" border="0" style="height: 25vh; width: 25vh; object-fit: cover; object-position: center; border-radius: 1em; margin-bottom: 0em;" />
            
            </div>

            <div style="display: flex; justify-content: center; gap: 2em; flex-direction: column; align-items: center; flex-grow: 1;">
                
                <div style="display: flex; gap: 6em;">

                    <div style="display: flex; flex-direction: row ; align-items: center; gap: 1.33em">
                        <h2 style="margin-top: 0em">Nombre: </h2>
                        <p style="margin-top: 0em">${res.name}</p>
                    </div>

                    <div style="display: flex; flex-direction: row ; align-items: center; gap: 1.33em">
                        <h2 style="margin-top: 0em">Rol:</h2>
                        <p style="margin-top: 0em"> ${res.role}</p>
                    </div>

                </div>
                
                <div style="display: flex; flex-direction: column ; align-items: center; gap: 0.5em">
                    <h2 style="margin-top: 0em">Correo: </h2>
                    <p style="margin-top: 0em"> ${res.email}</p>
                </div>

            </div>
            
        </div>`

        sectionPerfil.innerHTML = htmlPerfil;

        // HTML para el boton de editar perfil:
        let htmlEditarP = "";

        htmlEditarP += `<button class="boton" id="btnEditarPerfil">Editar perfil</button>`

        btnsEditarPerfil.innerHTML = htmlEditarP;

        // Captura bóton de editar perfil funcion:
        const btnEditarPerfil = document.getElementById('btnEditarPerfil');

        // Escuchamos el envento del bóton:
        btnEditarPerfil.addEventListener("click", () => {
            editarPerfil();
        });
    };

};

verPerfil();

// Captura div script input file personalizado:
const inputFileCustom = document.getElementById('inputFileCustom');

// Función para editar perfil:
async function editarPerfil() {

    const response = await fetch('/api/sessions/profile', {
        method: 'GET',
    })

    const res = await response.json();

    if (res) {

        let htmlPerfil = ""

        htmlPerfil += `

        <form id="editProfileForm" style="display: flex; justify-content: center; gap: 2em; flex-direction: row; align-items: center; width: 100%;">

            <div style="display: flex; justify-content: center; gap: 0em; flex-direction: column; align-items: center; width: 80%; border-right: 0.1em solid #95d0f7; padding-right: 1.5em">

            <img src=${res.photo} alt="ADD-PHOTO" border="0" style="height: 25vh; width: 25vh; object-fit: cover; object-position: center; border-radius: 1em; margin-bottom: 1em;" />
        
                <div>

                    <div style="display: flex; justify-content: center; gap: 1em; flex-direction: column; align-items: center;">
                        
                        <input type="file" id="archivoInputProfile" name="profile" style="display: none;">

                        <label for="archivoInputProfile" style="padding: 10px; font-family: 'Montserrat'; background-color: #bfe4fd; color: #002877; cursor: pointer; border-radius: 1em; border: none;">
                            <span id="nombreArchivo">Agrega una foto de perfil</span>
                        </label>

                    </div>
                
                </div>

            </div>

            <div style="display: flex; justify-content: center; gap: 1.5em; flex-direction: column; align-items: center; flex-grow: 1; width: 120% !important">
        
                    <div style="width: 100% !important">
        
                        <h2 style="margin-top: 0em">Nombre:</h2>
                        <input style="margin-top: 0.5em; width: 100% !important" type="text" id="nombreInput" name="name"
                            placeholder="${res.name}" required>
        
                    </div>
        
                    <div style="width: 100% !important">
                        <h2 style="margin-top: 0em">Correo:</h2>
                        <input style="margin-top: 0.5em; width: 100% !important" type="text" id="correoInput" name="email"
                            placeholder="${res.email}" required>
                    </div>
        
            </div>
        
        </form>`

        sectionPerfil.innerHTML = htmlPerfil;

        let htmlEditarP = "";

        htmlEditarP += `<button class="boton" id="btnConfirmarCambios">Confirmar cambios</button>`

        btnsEditarPerfil.innerHTML = htmlEditarP;

        const archivoInputProfile = document.getElementById('archivoInputProfile');
        const nombreArchivo = document.getElementById('nombreArchivo');

        archivoInputProfile.addEventListener('change', () => {
            const archivos = archivoInputProfile.files;
            nombreArchivo.textContent = archivos[0].name;
        })

        // Captura formulario: 

        const formEditProfile = document.getElementById('editProfileForm');

        // Captura bóton de confirmar cambios función:
        const btnConfirmarCambios = document.getElementById('btnConfirmarCambios');

        // Escuchamos el envento del bóton:
        btnConfirmarCambios.addEventListener("click", () => {
            confirmarCambios(formEditProfile);
        });

    };
};

async function confirmarCambios(formEditProfile) {

    // Crear un objeto FormData a partir del formulario
    const data = new FormData(formEditProfile);

    try {
        // Realizar una solicitud POST al servidor con los datos del formulario:
        const response = await fetch('/api/sessions/editProfile', {
            method: 'POST',
            body: data,
        });

        const res = await response.json();
        const statusCodeRes = res.statusCode;
        const messageRes = res.message;
        const customError = res.cause;

        if (statusCodeRes === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Editar perfil',
                text: messageRes || 'Perfil actualizado exitosamente.',
            });
            setTimeout(() => {
                verPerfil();
            }, 2000);
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar actualizar perfil',
                text: customError || 'Hubo un problema al intentar actualizar perfil.',
            });
        } else if (statusCodeRes === 400) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin cambios',
                text: messageRes || 'No se realizaron cambios en el perfil.',
            })
            setTimeout(() => {
                verPerfil();
            }, 2000);
        } else if (statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar cerrar session',
                text: messageRes || 'Hubo un problema al intentar intentar actualizar perfil.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar cerrar session',
                text: messageRes || 'Hubo un problema al intentar intentar actualizar perfil.',
            });
        };

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de editar perfil',
            text: 'Error: ' + error.message
        });
    };

};

// Captura bóton cerrar session:
const btnCerrarSession = document.getElementById('btnCerrarSession');

// Escuchamos el envento del bóton:
btnCerrarSession.addEventListener("click", () => {
    cerrarSession();
});

async function cerrarSession() {

    try {

        const response = await fetch('/api/sessions/logout', {
            method: 'POST',
        })

        const res = await response.json();
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.message;

        if (statusCode === 200) {

            Swal.fire({
                icon: 'success',
                title: 'Logout',
                text: message || 'La session se ha cerrado exitosamente',
            });

            setTimeout(() => {
                window.location.replace('/login');
            }, 2000);

        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar cerrar session',
                text: customError || 'Hubo un problema al intentar cerrar la session.',
            });
        } else if (statusCode === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar cerrar session',
                text: message || 'Hubo un problema al intentar cerrar la session.',
            });
        } else if (statusCode === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar cerrar session',
                text: message || 'Hubo un problema al intentar cerrar la session.',
            });
        };

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de cerrar session',
            text: 'Error: ' + error.message
        });
    };

};

// Captura bóton eliminar cuenta:
const btnCerrarCuenta = document.getElementById('btnCerrarCuenta');

// Escuchamos el envento del bóton:
btnCerrarCuenta.addEventListener("click", async () => {

    // Mostrar SweetAlert de confirmación
    const confirmationResult = await Swal.fire({
        title: 'Confirmar eliminación de cuenta',
        text: '¿Estás seguro de que deseas eliminar tu cuenta? Ten en cuenta que esta acción conllevará la eliminación de tu carrito actual y todos los productos que hayas publicado como usuario premium.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
    });

    if (confirmationResult.isConfirmed) {
        cerrarCuenta();
    };

});

async function cerrarCuenta() {

    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });

    const sessionRes = await sessionResponse.json();
    const uid = sessionRes.userId;
    const cid = sessionRes.cart;

    try {

        const response = await fetch(`api/sessions/deleteAccount/${uid}`, {
            method: 'DELETE',
        })

        const res = await response.json();
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.message;

        if (statusCode === 200) {

            Swal.fire({
                icon: 'success',
                title: 'Eliminar cuenta',
                text: message || 'La cuenta se ha eliminado exitosamente',
            });

            setTimeout(() => {
                window.location.replace('/login');
            }, 4000);

        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar eliminar cuenta',
                text: customError || 'Hubo un problema al intentar eliminar la cuenta.',
            });
        } else if (statusCode === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar eliminar cuenta',
                text: message || 'Hubo un problema al intentar eliminar la cuenta.',
            });
        } else if (statusCode === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar eliminar cuenta',
                text: message || 'Hubo un problema al intentar eliminar la cuenta.',
            });
        };

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de eliminar cuenta',
            text: 'Error: ' + error.message
        });
    };

};