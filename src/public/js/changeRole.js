const form = document.getElementById('uploadDocuments');

async function cargaChageRole() {

    const response = await fetch('/api/sessions/getDocsUser', {
        method: 'GET',
    })

    const res = await response.json();

    if (res.docs.length > 0) {
        for (let i = 0; i < res.docs.length; i++) {
            const documento = res.docs[i];
            const nombreArchivo =  extractFileNameWithUID(documento.reference);

            // Verifica el tipo de documento y actualiza el span correspondiente
            if (documento.name === "Identificación") {
                let spanArchivo = document.getElementById('nombreArchivo1');
                spanArchivo.textContent = nombreArchivo;
            } else if (documento.name === "Comprobante de domicilio") {
                let spanArchivo = document.getElementById('nombreArchivo2');
                spanArchivo.textContent = nombreArchivo;
            } else if (documento.name === "Comprobante de estado de cuenta") {
                let spanArchivo = document.getElementById('nombreArchivo3');
                spanArchivo.textContent = nombreArchivo;
            }
        }
    }
}

cargaChageRole();

// Función para extraer el nombre del archivo de una URL con uid:
function extractFileNameWithUID(url) {
    const match = url.match(/[-\w]+\s*-\s*(.+)/);
    if (match) {
        const nombreArchivo = match[1];
        return nombreArchivo;
    }
    return url;
}

const cargarDocs = document.getElementById('cargarDocs');
// Escuchamos el envento del bóton de Cargar docs:
cargarDocs.addEventListener("click", (event) => {
    event.preventDefault();
    cargarDocuments();
});

// Función para subir documentos:
async function cargarDocuments() {

    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });

    const sessionRes = await sessionResponse.json();
    const uid = sessionRes.userId;

    if (uid) {

        try {

            const formDocs = new FormData(form);

            const uploadDocsRes = await fetch(`/api/users/${uid}/documents`, {
                method: 'POST',
                body: formDocs
            });

            const docsRes = await uploadDocsRes.json();
            const statusCodeDocsRes = docsRes.statusCode;
            const messageRes = docsRes.message;
            const customError = docsRes.cause;

            console.log(docsRes)

            if (statusCodeDocsRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Cargar documentación',
                    text: messageRes || 'Documentación actualizada exitosamente.',
                });
                setTimeout(() => {
                    cargaChageRole();
                    form.reset();
                }, 2000);
            }
            if (statusCodeDocsRes === 206) {
                Swal.fire({
                    icon: 'ifo',
                    title: 'Cargar documentación',
                    text: messageRes || 'Documentación actualizada exitosamente.',
                });
                setTimeout(() => {
                    cargaChageRole();
                }, 2000);
            } else if (customError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar cargar documentación',
                    text: customError || 'Hubo un problema al intentar cargar la documentación.',
                });
            } else if (statusCodeDocsRes === 404) {
                Swal.fire({
                    icon: 'info',
                    title: 'Error al intentar cargar documentación',
                    text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                });
            } else if (statusCodeDocsRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar cargar documentación',
                    text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: "Error en la solicitud de cargar documentos",
                text: 'Error: ' + error.message
            });
        }
    }

}







/*



const ChangeROLE = document.getElementById('ChangeROLE');



ChangeROLE.addEventListener('click', async (e) => {

    e.preventDefault();

    try {
        const sessionResponse = await fetch('/api/sessions/current');
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const uid = sessionData.userId;

            const response = await changeRole(uid);
            const data = await response.json();
            if (response.ok) {
                if (data.statusCode === 200) {
                    Swal.fire({
                        icon: 'success',
                        text: data.message,
                    });
                }
            } else if (data.statusCode === 422) {
                Swal.fire({
                    icon: 'info',
                    text: data.message,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: "Error en la solicitud - Actualizar Role",
                    text: data.message,
                });
            }

        } else {
            console.error('Error en la solicitud - Current Session: ' + sessionResponse - json());
        }
    } catch (error) {
        console.error('Error en la solicitud - changeRole.js 2: ' + error.message);
    }
});

async function changeRole(uid) {
    return fetch(`/api/users/premium/${uid}`, {
        method: 'POST'
    });
}

const cargarDocs = document.getElementById('cargarDocs');
// Escuchamos el envento del bóton de Cargar docs:
cargarDocs.addEventListener("click", () => {
    cargarDocuments();
});


const ChangeROLE = document.getElementById('ChangeROLE');
*/