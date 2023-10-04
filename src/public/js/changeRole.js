const form = document.getElementById('uploadDocuments');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
        const sessionResponse = await fetch('/api/sessions/current');
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const uid = sessionData.userId;

            const response = await uploadDocuments(uid, formData);
            const data = await response.json();

            if (response.ok) {
                if (data.statusCode === 206) {
                    Swal.fire({
                        icon: 'info',
                        text: data.message,
                    });
                }
                if (data.statusCode === 200) {
                    Swal.fire({
                        icon: 'success',
                        text: data.message,
                    });
                    form.reset();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: "Error en la solicitud - Cargar documentos",
                    text: data.message,
                });
            }
        } else {
            console.error('Error en la solicitud - Current Session: ' + sessionResponse - json());
        }
    } catch (error) {
        console.error('Error en la solicitud - changeRole.js 1: ' + error.message);
    }
});

async function uploadDocuments(uid, formData) {
    return fetch(`/api/users/${uid}/documents`, {
        method: 'POST',
        body: formData
    });
}

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