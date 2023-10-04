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

            console.log('Response status:', response.status); // Agrega este console.log

            if (response.ok) {
                const data = await response.json();
                console.log('Data:', data); // Agrega este console.log

                form.reset();
            } else {
                console.error('Error en la solicitud - Upload Documents:', response.statusText);
            }
        } else {
            console.error('Error en la solicitud - Current Session:', sessionResponse.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud - changeRole.js:', error.message);
    }
});

async function uploadDocuments(uid, formData) {
    return fetch(`/api/users/${uid}/documents`, {
        method: 'POST',
        body: formData
    });
}