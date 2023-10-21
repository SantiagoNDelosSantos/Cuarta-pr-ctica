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

// Cpturamos el formulario:
const form = document.getElementById('uploadDocuments');

// Función que actualiza los nombres de los campos en base a la documentación existente en la DB:
async function cargaChageRole() {

    try {
        // Buscamos la documentación actual del usuario:
        const response = await fetch('/api/sessions/getDocsUser', {
            method: 'GET',
        })

        // Si falla la validación del token:
        if (response.redirected) {
            const invalidTokenURL = response.url;
            window.location.replace(invalidTokenURL);
        }

        // Pasamos a la respuesta a json: 
        const res = await response.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (res.status === 401) {

            Swal.fire({
                title: res.h1,
                text: res.message,
                imageUrl: res.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: res.h1,
            })

        } else {

            const statusCodeRes = res.statusCode;
            const messageRes = res.message;
            const docs = res.result.docs;

            if (statusCodeRes === 200) {
                if (docs.length > 0) {
                    for (let i = 0; i < docs.length; i++) {
                        const documento = docs[i];
                        const nombreArchivo = extractFileNameWithUID(documento.reference);
                        // Verifica el tipo de documento y actualiza el span correspondiente:
                        if (documento.name === "Identificación") {
                            let spanArchivo = document.getElementById('nombreArchivo1');
                            spanArchivo.textContent = nombreArchivo;
                        } else if (documento.name === "Comprobante de domicilio") {
                            let spanArchivo = document.getElementById('nombreArchivo2');
                            spanArchivo.textContent = nombreArchivo;
                        } else if (documento.name === "Comprobante de estado de cuenta") {
                            let spanArchivo = document.getElementById('nombreArchivo3');
                            spanArchivo.textContent = nombreArchivo;
                        };
                    };
                };
            } else if (statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al obtener documentación del usuario',
                    text: messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al obtener documentación del usuario',
                    text: messageRes
                });
            };
        };
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud obtener documentación del usuario.',
            text: 'Error: ' + error.message
        });
    };
};

cargaChageRole();

// Función para extraer el nombre del archivo de una URL con uid:
function extractFileNameWithUID(url) {
    const match = url.match(/[-\w]+\s*-\s*(.+)/);
    if (match) {
        const nombreArchivo = match[1];
        return nombreArchivo;
    };
    return url;
};

const cargarDocs = document.getElementById('cargarDocs');
// Escuchamos el envento del bóton de Cargar docs:
cargarDocs.addEventListener("click", (event) => {
    event.preventDefault();
    cargarDocuments();
});

// Función para subir documentos:
async function cargarDocuments() {

    try {

        // Buscamos al usuario: 
        const sessionResponse = await fetch('/api/sessions/current', {
            method: 'GET',
        });

        // Si falla la validación del token:
        if (sessionResponse.redirected) {
            const invalidTokenURL = sessionResponse.url;
            window.location.replace(invalidTokenURL);
        }

        // Pasamos a la respuesta a json: 
        const sessionRes = await sessionResponse.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (sessionRes.status === 401) {

            Swal.fire({
                title: sessionRes.h1,
                text: sessionRes.message,
                imageUrl: sessionRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: sessionRes.h1,
            })

        } else {

            try {

                let uid = sessionRes.userId;

                const formDocs = new FormData(form);

                const uploadDocsRes = await fetch(`/api/users/${uid}/documents`, {
                    method: 'POST',
                    body: formDocs
                });

                // Si falla la validación del token:
                if (uploadDocsRes.redirected) {
                    const invalidTokenURL = uploadDocsRes.url;
                    window.location.replace(invalidTokenURL);
                };

                // Pasamos a la respuesta a json: 
                const docsRes = await uploadDocsRes.json();

                // Si no se cumplen con los permisos para acceder a la ruta: 
                if (docsRes.status === 401) {

                    Swal.fire({
                        title: docsRes.h1,
                        text: docsRes.message,
                        imageUrl: docsRes.img,
                        imageWidth: 70,
                        imageHeight: 70,
                        imageAlt: docsRes.h1,
                    });

                } else {

                    const statusCodeDocsRes = docsRes.statusCode;
                    const messageRes = docsRes.message;
                    const customError = docsRes.message;

                    if (statusCodeDocsRes === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cargar documentación',
                            text: messageRes || 'Documentación actualizada exitosamente.',
                        });
                        setTimeout(() => {
                            cargaChageRole();
                        }, 2000);
                    } else if (statusCodeDocsRes === 206) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Cargar documentación',
                            text: messageRes || 'Documentación actualizada exitosamente.',
                        });
                        setTimeout(() => {
                            cargaChageRole();
                        }, 2000);
                    } else if (customError || statusCodeDocsRes === 404) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Error al intentar cargar documentación',
                            text: customError || messageRes || 'Hubo un problema al intentar cargar la documentación.',
                        });
                    } else if (statusCodeDocsRes === 500) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al intentar cargar documentación',
                            text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                        });
                    }
                };

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: "Error en la solicitud de cargar documentos",
                    text: 'Error: ' + error.message
                });
            };
        };

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: "Error en la solicitud de obtener credenciales del usuario",
            text: 'Error: ' + error.message
        });
    };

};

const ChangeROLE = document.getElementById('ChangeROLE');

ChangeROLE.addEventListener("click", async (event) => {

    event.preventDefault();

    try {

        // Buscamos al usuario: 
        const sessionResponse = await fetch('/api/sessions/current', {
            method: 'GET',
        });

        // Si falla la validación del token:
        if (sessionResponse.redirected) {
            const invalidTokenURL = sessionResponse.url;
            window.location.replace(invalidTokenURL);
        }

        // Pasamos a la respuesta a json: 
        const sessionRes = await sessionResponse.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (sessionRes.status === 401) {

            Swal.fire({
                title: sessionRes.h1,
                text: sessionRes.message,
                imageUrl: sessionRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: sessionRes.h1,
            })

        } else {

            let uid = sessionRes.userId;
            let role = sessionRes.role;

            if (role === "user") {
                // Mostrar SweetAlert de confirmación (User a Premium):
                const confirmationResult = await Swal.fire({
                    title: 'Confirmar cambio de role',
                    text: '¿Deseas actualizar a "Premium"? Los usuarios premium pueden publicar, editar y eliminar productos, aunque el administrador puede eliminar contenido que incumpla nuestras políticas. ¿Confirmas el cambio?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, confirmar',
                    cancelButtonText: 'Cancelar',
                });

                if (confirmationResult.isConfirmed) {
                    cambiarRole(uid);
                }
            } else if (role === "premium") {
                // Mostrar SweetAlert de confirmación (Premium a User):
                const confirmationResult = await Swal.fire({
                    title: 'Confirmar cambio de role',
                    text: '¿Estás seguro de que deseas cambiar a role "User"? Ten en cuenta que si realizas este cambio, todos los productos que hayas publicado como usuario premium serán eliminados automáticamente de la plataforma. ¿Confirmas esta modificación?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, confirmar',
                    cancelButtonText: 'Cancelar',
                });

                if (confirmationResult.isConfirmed) {
                    cambiarRole(uid);
                }
            }

        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: "Error en la solicitud de obtener credenciales del usuario",
            text: 'Error: ' + error.message
        });
    };

});

async function cambiarRole(uid) {

    try {

        // Solicitud de cambio de role:
        const response = await fetch(`/api/users/premium/${uid}`, {
            method: 'POST',
        });

        // Si falla la validación del token:
        if (response.redirected) {
            const invalidTokenURL = response.url;
            window.location.replace(invalidTokenURL);
        };

        // Pasamos a la respuesta a json: 
        const res = await response.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (res.status === 401) {

            Swal.fire({
                title: res.h1,
                text: res.message,
                imageUrl: res.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: res.h1,
            });

        } else {

            const statusCode = res.statusCode;
            const message = res.message;
            const customError = res.cause;

            if (statusCode === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizar role',
                    text: message || 'Role actualizado exitosamente.',
                });
            } else if (customError || statusCode === 404 || statusCode === 422) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar actualizar role',
                    text: customError || message || 'Hubo un problema al intentar actualizar role del user.',
                });
            } else if (statusCode === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar actualizar role',
                    text: message || 'Hubo un problema al intentar actualizar role del user.',
                });
            }
        };

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de actualizar role',
            text: 'Error: ' + error.message
        });
    };

};