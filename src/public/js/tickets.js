// Captura tabla de tickets:
const tableTicket = document.getElementById('tableTickets');

// Creamos una función para la carga de los tickets: 
async function loadTickets() {

    // Obtenemos los datos del usuario: 
    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });

    // Si falla la validación del token:
    if (sessionResponse.redirected) {
        let invalidTokenURL = sessionResponse.url;
        window.location.replace(invalidTokenURL);
    }

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

            let cid = sessionRes.cart;

            // Obtenemos el carrito del usuario: 
            const cartResponse = await fetch(`/api/carts/${cid}`, {
                method: 'GET',
            })

            // Si falla la validación del token:
            if (cartResponse.redirected) {
                const invalidTokenURL = cartResponse.url;
                window.location.replace(invalidTokenURL);
            }

            // Pasamos a la respuesta a json: 
            const cartRes = await cartResponse.json();

            // Si no se cumplen con los permisos para acceder a la ruta: 
            if (sessionRes.status === 401) {

                Swal.fire({
                    title: cartRes.h1,
                    text: cartRes.message,
                    imageUrl: cartRes.img,
                    imageWidth: 70,
                    imageHeight: 70,
                    imageAlt: cartRes.h1,
                })

            } else {

                // Si se pudo acceder a la ruta, entonces extraemos la info necesaria:
                const statusCodeRes = cartRes.statusCode;
                const messageRes = cartRes.message;
                const customError = cartRes.cause;
                const resultCart = cartRes.result;

                if (statusCodeRes === 200) {

                    // Si no hay productos:
                    if (resultCart.tickets.length === 0) {
                        tableTicket.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; margin-top: 0em; flex-direction: column;">
                        <img style="width: 11vw; margin-top: 0em; margin-left: 0.5em; margin-bottom: 2.5em;" src="https://i.ibb.co/R7YQYKk/tip-removebg-preview.png" alt="tip-removebg-preview" >
                        <h2>Aún no has realizado ninguna compra.</h2>
                        <br>
                        <h2>¡No te preocupes! Una vez realices una compra, podrás consultar tus tickets aquí.</h2>
                        </div>`
                    } else if (resultCart.tickets.length > 0) {
                        // Si hay tickets:
                        loadTableTicket(resultCart);
                    }

                } else if (customError || statusCodeRes === 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Error en el carrito',
                        text: customError || messageRes
                    });
                } else if (statusCodeRes === 500) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en el carrito',
                        text: messageRes
                    });
                }
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud de obtener tickets del carrito',
                text: 'Error: ' + error.message
            });
        }

    }

};

loadTickets();
async function loadTableTicket(resultCart) {
    const tableTicketsCart = document.getElementById('tableTicketsCart');
    tableTicketsCart.innerHTML = "";

    resultCart.tickets.forEach(ticket => {
        let dateTime = ticket.ticketsRef.purchase_datetime;
        let code = ticket.ticketsRef.code;
        let total = ticket.ticketsRef.amount;
        let success = ticket.ticketsRef.successfulProducts;
        let fail = ticket.ticketsRef.failedProducts;

        const ticketRow = `
            <tr>
                <td>${dateTime}</td>
                <td>${code}</td>
                <td class="success-products">${getProductsHTML(success, "success")}</td>
                <td class="fail-products">${getProductsHTML(fail, "fail")}</td>
                <td><h2>$ ${total}</h2></td>
            </tr>
        `;

        tableTicketsCart.insertAdjacentHTML('beforeend', ticketRow);
    });
};

// Función para montar los productos exitosos y fallidos:
function getProductsHTML(products, type) {
    if (products && products.length > 0 && type === "success") {
        const productList = products.map(product => `
            <li class="product-item" style="border: 0.1em solid #ccc; border-radius: 1em; padding: 0.5em; margin: 0.5em 0em;">
                <p style="margin: 0em; padding-top: 0em; color: #36b620">
                    ${product.title}: Cantidad ${product.quantity} - Precio $ ${product.price} - Subtotal: $ ${product.quantity * product.price}
                </p>
            </li>
        `).join('');
        return `<ul>${productList}</ul>`;
    } else if (products && products.length > 0 && type === "fail") {
        const productList = products.map(product => `
            <li class="product-item" style="border: 0.1em solid #ccc; border-radius: 1em; padding: 0.5em; margin: 0.5em 0em;">
                <p style="margin: 0em; padding-top: 0em; color: #b50000">
                    ${product.title}: Cantidad ${product.quantity} - Precio $ ${product.price} - Subtotal: $ ${product.quantity * product.price} 
                </p>
            </li>
        `).join('');
        return `<ul>${productList}</ul>`;
    } else {
        return "Ningún producto.";
    };
};

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