const parrafo = document.getElementById("parrafo")

// Creamos una función general para la carga de la vsita:
async function paySuccess() {

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

            // Reflejar la compra en la base de datos:
            const purchaseResponse = await fetch(`/api/carts/${sessionRes.cart}/purchaseSuccess`, {
                method: 'POST',
            });

            // Si falla la validación del token:
            if (purchaseResponse.redirected) {
                const invalidTokenURL = purchaseResponse.url;
                window.location.replace(invalidTokenURL);
            }

            // Pasamos a la respuesta a json: 
            const purchaseRes = await purchaseResponse.json();

            // Si no se cumplen con los permisos para acceder a la ruta: 
            if (purchaseRes.status === 401) {
                Swal.fire({
                    title: purchaseRes.h1,
                    text: purchaseRes.message,
                    imageUrl: purchaseRes.img,
                    imageWidth: 70,
                    imageHeight: 70,
                    imageAlt: purchaseRes.h1,
                })
            } else {

                const statusCodeRes = purchaseRes.statusCode;
                const messageRes = purchaseRes.message;
                const customError = purchaseRes.cause;

                if (statusCodeRes === 200) {
                    parrafo.innerHTML = `
                    <p style="margin: 0.7em">¡Estimado ${sessionRes.name}, nos complace informarte que tu pago se ha completado con éxito!</p>
                    <p style="margin: 0.7em">En breve, encontrarás el recibo de compra en la sección de tickets de tu carrito. Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte. Estamos aquí para ayudarte en todo lo que necesites.</p>
                    <p style="margin: 0.7em">Gracias por tu compra. Atentamente, Global Technology.</p>
                    `;
                } else if (customError || statusCodeRes === 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'El pago ya fue realizado, pero hubo un error al procesar la compra',
                        text: customError || messageRes
                    });
                } else if (statusCodeRes === 500) {
                    Swal.fire({
                        icon: 'error',
                        title: 'El pago ya fue realizado, pero hubo un error al procesar la compra',
                        text: messageRes
                    });
                }
            };          
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud de procesar compra',
                text: 'Error: ' + error.message
            });
        };
    };
};

paySuccess();

// Ocultar la vista de carga después de 1 segundo (1000 milisegundos):
const carga = document.getElementById("VistaDeCarga");
const vista = document.getElementById("contenedorVista");

function pantallaCarga() {
    setTimeout(() => {
        carga.style = "display: none";
        vista.style = "display: block";
    }, 500);
};
pantallaCarga();