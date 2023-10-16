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

// Captura tabla de productos en carrito:
const tableCarts = document.getElementById('tableCarts');

// Captura div cierre:
const cierreCompra = document.getElementById('cierreCompra');

// Declaramos de manera global el cid:
let cid;

// Creamos una función general para la carga del carrito y sus actualizaciones:
async function loadCart() {

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

      cid = sessionRes.cart;

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

          if (messageRes !== "Carrito obtenido exitosamente.") {
            setTimeout(() => {
              Swal.fire({
                icon: 'info',
                title: 'Se han eliminado productos',
                text: messageRes
              });
            }, 1000);
          }

          // Si no hay productos:
          if (resultCart.products.length === 0) {
            tableCarts.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; margin-top: 0em; flex-direction: column;">
            <img style="width: 11vw; margin-top:2em; margin-bottom: 4em;" src="https://i.ibb.co/GTbyDDP/CARTVACIO-removebg-preview.png">
            <h2>Tu carrito de compras está vacío. ¡Agrega productos para comenzar a comprar!</h2>
            </div>`

            cierreCompra.innerHTML = ""

          } else if (resultCart.products.length > 0) {
            // Si hay productos:
            loadProducts(resultCart);
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
        title: 'Error en la solicitud de obtener carrito',
        text: 'Error: ' + error.message
      });
    }

  }

}

loadCart()

async function loadProducts(resultCart) {

  const tableProdCartID = document.getElementById('tableProdCartID')

  let total = 0;

  tableProdCartID.innerHTML = ""

  resultCart.products.forEach((product) => {

    let title = product.product.title;
    let stock = product.product.stock
    let img = product.product.thumbnails[0].reference
    let price = product.product.price;
    let quantityInCart = product.quantity;
    let pidInCart = product._id;
    let subtotal = price * quantityInCart;

    total += subtotal

    const productRow = `
          <tr>
            <td>${title}</td>
            <td><img src="${img}" alt="${title}" class="Imgs"></td>
            <td>${stock}</td>
            <td>
              <input type="number" class="input-quantity" quantity-product-id="${pidInCart}" value="${quantityInCart}" data-product-title="${title}" min="1" max="${stock}">
            </td>
            <td>$ ${price}</td>
            <td class="subtotal">$ ${subtotal}</td>
            <td>
              <img style="width: 3em;" class="botonD papelera-icon" data-product-id="${pidInCart}" data-product-title="${title}" src="https://i.ibb.co/9rmL91b/papelera.png" alt="papelera">
            </td>
          </tr>`;

    tableProdCartID.insertAdjacentHTML('beforeend', productRow);

  })

  tableProdCartID.innerHTML += `
    <tr>
      <td style="border: none;"></td>
      <td style="border: none;"></td>
      <td style="border: none;"></td>
      <td style="border: none;"></td>
      <td style="border: none;"></td>
      <td style="border: none;"></td>
      <td style="border: none;"> <h2 class="boton" id="vaciarCarrito">Vaciar carrito</h2> </td>
    </tr>`;

  const vaciarCarrito = document.getElementById('vaciarCarrito');

  vaciarCarrito.addEventListener("click", async () => {
    deleteAllProds();
  })


  cierreCompra.innerHTML = `<h2>Total a pagar $ <span id="totalPrice">${total}</span></h2> <br />
  <h2 id="finalizarCompraBtn" style="width: 60%; margin-left: 20%; margin-right: 20%;" class="boton" id="finalizarCompra">Finalizar Compra</h2> <br />`;

}

// addEventListener para modificar quantity:
document.addEventListener('input', async (event) => {

  if (event.target.classList.contains('input-quantity')) {
    const pid = event.target.getAttribute('quantity-product-id');
    const title = event.target.getAttribute('data-product-title');
    let newQuantity = parseInt(event.target.value, 10);
    const stock = parseInt(event.target.getAttribute('max'), 10);

    if (newQuantity < 1) {
      event.target.value = '1';
    } else if (newQuantity > stock) {
      event.target.value = stock;
    }

    if (newQuantity > 0) {

      const putData = {
        quantity: parseInt(event.target.value, 10)
      };

      try {

        // Enviamos el nuevo quantity: 
        const quantityResponse = await fetch(`/api/carts/${cid}/products/${pid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putData)
        })

        // Si falla la validación del token:
        if (quantityResponse.redirected) {
          const invalidTokenURL = quantityResponse.url;
          window.location.replace(invalidTokenURL);
        }

        // Pasamos a la respuesta a json: 
        const quantityRes = await quantityResponse.json();

        // Si no se cumplen con los permisos para acceder a la ruta: 
        if (quantityRes.status === 401) {

          Swal.fire({
            title: quantityRes.h1,
            text: quantityRes.message,
            imageUrl: quantityRes.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: quantityRes.h1,
          })

        } else {

          // Si se pudo acceder a la ruta, entonces extraemos la info necesaria:
          const statusCodeRes = quantityRes.statusCode;
          const messageRes = quantityRes.message;
          const customError = quantityRes.cause;

          if (statusCodeRes === 200) {

            Swal.fire({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              title: `Has actualizado ${title} a ${newQuantity} Unds. exitosamente.`,
              icon: 'success'
            });

            const cartResponse = await fetch(`/api/carts/${cid}`, {
              method: 'GET',
            })
            const cartRes = await cartResponse.json();
            const resultCart = cartRes.result;
            loadProducts(resultCart);

          } else if (customError || statusCodeRes === 404) {
            Swal.fire({
              icon: 'warning',
              title: 'Error al actualizar cantidad del producto en el carrito',
              text: customError || messageRes
            });
          } else if (statusCodeRes === 500) {
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar cantidad del producto en el carrito',
              text: messageRes
            });
          }

        }

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la solicitud de actualizar cantidad del producto en el carrito',
          text: 'Error: ' + error.message
        });
      }
    }

  }
});

// addEventListener para el botón de eliminar
tableProdCartID.addEventListener('click', async (event) => {
  if (event.target.classList.contains('botonD')) {
    const pid = event.target.getAttribute('data-product-id');
    const title = event.target.getAttribute('data-product-title');
    deleteToCart(pid, title);
  }
});

// Función para eliminar un producto del carrito
async function deleteToCart(pid, title) {

  try {

    // Enviamos el carrito y el producto a eliminar: 
    const deleteResponse = await fetch(`/api/carts/${cid}/products/${pid}`, {
      method: 'DELETE',
    });

    // Si falla la validación del token:
    if (deleteResponse.redirected) {
      const invalidTokenURL = deleteResponse.url;
      window.location.replace(invalidTokenURL);
    }

    // Pasamos a la respuesta a json: 
    const deleteRes = await deleteResponse.json();

    // Si no se cumplen con los permisos para acceder a la ruta: 
    if (deleteRes.status === 401) {

      Swal.fire({
        title: deleteRes.h1,
        text: deleteRes.message,
        imageUrl: deleteRes.img,
        imageWidth: 70,
        imageHeight: 70,
        imageAlt: deleteRes.h1,
      })

    } else {

      // Si se pudo acceder a la ruta, entonces extraemos la info necesaria:
      const statusCodeRes = deleteRes.statusCode;
      const messageRes = deleteRes.message;
      const customError = deleteRes.cause;

      if (statusCodeRes === 200) {

        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          title: `Has eliminado ${title} de tu carrito exitosamente.`,
          icon: 'success'
        });

        const cartResponse = await fetch(`/api/carts/${cid}`, {
          method: 'GET',
        })

        const cartRes = await cartResponse.json();
        const resultCart = cartRes.result;
        loadProducts(resultCart);

      } else if (customError || statusCodeRes === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'Error al eliminar el producto en el carrito',
          text: customError || messageRes
        });
      } else if (statusCodeRes === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar el producto en el carrito',
          text: messageRes
        });
      }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud eliminar producto del carrito.',
      text: 'Error: ' + error.message
    });
  }

};

// Eliminar todos los productos del carrito:
async function deleteAllProds() {
  try {

    // Enviamos el carrito a vaciar: 
    const deleteAllResponse = await fetch(`/api/carts/${cid}`, {
      method: 'DELETE',
    });

    // Si falla la validación del token:
    if (deleteAllResponse.redirected) {
      const invalidTokenURL = deleteAllResponse.url;
      window.location.replace(invalidTokenURL);
    }

    // Pasamos a la respuesta a json: 
    const deleteRes = await deleteAllResponse.json();

    // Si no se cumplen con los permisos para acceder a la ruta: 
    if (deleteRes.status === 401) {

      Swal.fire({
        title: deleteRes.h1,
        text: deleteRes.message,
        imageUrl: deleteRes.img,
        imageWidth: 70,
        imageHeight: 70,
        imageAlt: deleteRes.h1,
      })

    } else {

      const statusCodeRes = deleteRes.statusCode;
      const messageRes = deleteRes.message;
      const customError = deleteRes.cause;

      if (statusCodeRes === 200) {

        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          title: `Has eliminado todos los productos del carrito exitosamente.`,
          icon: 'success'
        });

        loadCart();

      } else if (customError || statusCodeRes === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'Error al eliminar los productos en el carrito',
          text: customError || messageRes
        });
      } else if (statusCodeRes === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar los productos en el carrito',
          text: messageRes
        });
      }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud eliminar todos los productos del carrito.',
      text: 'Error: ' + error.message
    });
  }
}




/*




// Función para actualizar el precio total y el botón de finalizar compra
function updateTotalPrice(products) {
  const totalPrice = calculateTotalPrice(products);
  const totalPriceSpan = document.getElementById('totalPrice');
  totalPriceSpan.textContent = ` $ ${totalPrice}`;

  // DOM boton finalizar compra: 
  const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
  finalizarCompraBtn.addEventListener('click', async () => {
    // Mostrar SweetAlert de confirmación
    const confirmationResult = await Swal.fire({
      title: 'Confirmar compra',
      text: '¿Estás seguro de que deseas finalizar la compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmationResult.isConfirmed) {
      // Continuar con la compra
      processPurchase(products);

      // Mostrar SweetAlert de procesamiento
      const processingAlert = await Swal.fire({
        title: 'Compra finalizada',
        text: 'En breve podrás acceder a la boleta de tu compra en la sección de tickets del carrito. ',
        icon: 'success',
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        allowOutsideClick: false
      });

    }
  });
}
























function processPurchase(products) {
  fetch('/api/sessions/current')
    .then(response => response.json())
    .then(data => {
      const cartID = data.cart;
      const userEmailAddress = data.email;

      // Crear un array de productos para enviar al servidor
      const productsToSend = products.map(product => {
        return {
          cartProductID: product._id, // _id del producto en carrito
          databaseProductID: product.product._id, // _id del producto en la base de datos
          quantity: product.quantity,
          title: product.product.title,
          price: product.product.price
        };
      });

      // Crear un objeto con los datos de la compra
      const purchaseData = {
        cartID: cartID,
        products: productsToSend, // Usar el array modificado
        userEmailAddress
      };

      // Mostrar los datos en la consola antes de enviarlos:
      console.log('Datos de compra a enviar:', purchaseData);

      // Enviar la información al servidor
      fetch(`/api/carts/${cartID}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(purchaseData)
        })
        .then(response => response.json())
        .then(data => {
          // Manejar la respuesta del servidor aquí si es necesario
          console.log(data);
        })
        .catch(error => {
          console.error('Error al procesar la compra:', error);
        });
    })
    .catch(error => {
      console.error('Error al obtener el ID del carrito:', error);
    });
}

*/