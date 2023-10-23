// Iniciar Socket:
const socket = io();

const botomStore = document.getElementById("storeButtonPrem")

async function saludoYAccesoPrem() {

  try {

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

      // Acceso a la vista de publicar, editar y elimiar productos: 
      if (sessionRes.role === "premium") {
        let botnPrem = ""
        botnPrem += `<a href="/storeProducts"><img src="https://i.ibb.co/Ptq3Y46/tienda.png" alt="login" border="0" class="logoS"></a>`
        botomStore.innerHTML = botnPrem;
      }

      setTimeout(() => {

        // Saludo de bienvenida - Parte 2:
        const saludoYaMostrado = localStorage.getItem('saludoMostrado');

        if (saludoYaMostrado === 'false') {

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${sessionRes.name}, has iniciado sesión con éxito.`,
          });

          // Marcar que el saludo se ha mostrado:
          localStorage.setItem('saludoMostrado', 'true');

        }

      }, 600);

    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud de obtener datos del usuario',
      text: 'Error: ' + error.message
    });
  };

};

saludoYAccesoPrem();

// Capturamos la tabla de productos del DOM:
const tableProd = document.getElementById('tableProd');

// Esta variable es para limitar el filtro de limit segun el total:
let totalDocs;

function allProducts() {

  // Primera carga de todos los productos:
  socket.on("products", (productsResponse) => {

    if (productsResponse.statusCode === 200) {

      let htmlProductos = "";

      htmlProductos += `
      <thead>
        <tr>
            <th>Modelo</th>
            <th>Descripción</th>
            <th>Img Front</th>  
            <th>Img Back</th> 
            <th>Stock</th>
            <th>Precio</th>
            <th>Unds. a comprar</th>
            <th>+ Cart</th>
        </tr>
      </thead>`;

      productsResponse.result.docs.forEach((product) => {
        htmlProductos += `
          <tr>
            <td id="${product.title}">${product.title}</td>
            <td class="description">${product.description}</td>
            <td><img src="${product.imgFront.reference}" alt="${product.title}" class="Imgs"></td>
            <td><img src="${product.imgBack.reference}" alt="${product.title}" class="Imgs"></td>
            <td>${product.stock} Und.</td>
            <td>$${product.price}</td>
            <td><input type="number" id="cantidadInput${product._id}" min="1" max="${product.stock}" value="1"></td>
            <td>
              <img id="agr${product._id}" src="https://i.ibb.co/rbtzRGS/A-adir-cart.png" alt="Agregar al carrito" class="cart-icon">
            </td>
          </tr>`;

      });

      tableProd.innerHTML = htmlProductos;

      // Obtengo el id de cada boton agregar al carrito:
      productsResponse.result.docs.forEach((product) => {

        const botonAgregar = document.getElementById(`agr${product._id}`);
        const titleElement = document.getElementById(`${product.title}`);
        const title = titleElement.textContent;

        botonAgregar.addEventListener('click', () => {
          const cantidadInput = document.getElementById(`cantidadInput${product._id}`);
          const quantity = cantidadInput.value;
          addToCart(product._id, title, quantity);
        });

      });

      // Guardamos en la variable el total de los productos devueltos: 
      totalDocs = productsResponse.result.totalDocs;

      // Captura div de Pags:
      const Pags = document.getElementById('Pags');

      // Paginación:
      const hasPrevPage = productsResponse.result.hasPrevPage;
      const currentPage = productsResponse.result.page;
      const hasNextPage = productsResponse.result.hasNextPage;

      let htmlPag = "";

      htmlPag +=
        `<button class="boton" id="Prev">Prev</button>
        <h2 class="pag pagNumber" id="numberPag">${currentPage}</h2>
        <button class="boton" id="Next">Next</button>`;

      Pags.innerHTML = htmlPag;

      const prevButton = document.getElementById('Prev');
      const nextButton = document.getElementById('Next');

      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (hasPrevPage === true) {
          cambiarPagina(currentPage, "prev");
        }
      });

      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (hasNextPage === true) {
          cambiarPagina(currentPage, "next");
        }
      })

    } else if (productsResponse.statusCode === 400) {
      Swal.fire({
        icon: 'warning',
        title: 'Filtro no válido',
        text: productsResponse.message
      });
    } else if (productsResponse.statusCode === 404) {
      Swal.fire({
        icon: 'warning',
        title: `${productsResponse.message}`,
        text: "No se encontraron productos que coincidan con la búsqueda."
      });
    } else if (productsResponse.statusCode === 500) {
      Swal.fire({
        icon: 'warning',
        title: 'Error al intentar obtener los productos',
        text: productsResponse.message
      });
    };

  })
}

allProducts()

async function addToCart(productID, title, quantity) {

  // Hacemos una solicitud a la ruta '/api/sessions/current para obtener los datos del usuario
  const response = await fetch('/api/sessions/current', {
    method: 'GET',
  })



  // Si falla la validación del token:
  if (response.redirected) {
    let invalidTokenURL = response.url;
    window.location.replace(invalidTokenURL);
  };

  // Pasamos la respuesta a json:
  const res = await response.json();

  // Si no se cumplen con los permisos para acceder a la ruta: 
  if (res.statusCode === 401) {

    Swal.fire({
      title: res.h1,
      text: res.message,
      imageUrl: res.img,
      imageWidth: 70,
      imageHeight: 70,
      imageAlt: res.h1,
    });

  } else {

    // Aquí recibimos los datos del usuario en la variable 'data'
    let user = res;
    const cartID = user.cart;
    const productIDValue = productID;

    // Realizar una solicitud POST al servidor con los datos del formulario:
    const responseAdd = await fetch(`/api/carts/${cartID}/products/${productIDValue}/quantity/${quantity}`, {
      method: 'POST',
    })

    // Si falla la validación del token:
    if (responseAdd.redirected) {
      let invalidTokenURL = responseAdd.url;
      window.location.replace(invalidTokenURL);
    };

    // Pasamos la respuesta a json:
    const resAdd = await responseAdd.json();

      console.log("Y voscuando saltas" +  JSON.stringify(resAdd.status, null, 2))
  
    // Si no se cumplen con los permisos para acceder a la ruta: 
    if (resAdd.statusCode === 401) {

      Swal.fire({
        title: resAdd.h1,
        text: resAdd.message,
        imageUrl: resAdd.img,
        imageWidth: 70,
        imageHeight: 70,
        imageAlt: resAdd.h1,
      });

    } else {

      const statusCodeRes = resAdd.statusCode;
      const messageRes = resAdd.message;
      const customError = resAdd.cause;

      if (statusCodeRes === 200) {
        let titleS;
        if (quantity > 1) {
          titleS = `${quantity} Unds. de ${title} se han agregado a tu carrito`
        } else if (quantity = 1) {
          titleS = `${quantity} Und. de ${title} se ha agregado a tu carrito`
        }
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          title: titleS,
          icon: 'success'
        });
      } else if (customError || statusCodeRes === 404 || statusCodeRes === 403) {
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
      };

    };

  };

};

// Busqueda filtrada: 

// Variables para los filtros:
let limit;
let page;
let sort;
let filtro;
let filtroVal;

// Creamos la function filtrarProdcuts:
function filtrarProducts(limit, page, sort, filtro, filtroVal) {
  const busquedaProducts = {
    limit: limit || 10,
    page: page || 1,
    sort: sort || 1,
    filtro: filtro || null,
    filtroVal: filtroVal || null,
  }
  socket.emit('busquedaFiltrada', busquedaProducts);
};

// Todas las caterorías: 
const all = document.getElementById("All")
all.addEventListener('click', () => {
  filtro = "";
  filtroVal = "";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

// Buscar por categoría: 
const laptop = document.getElementById("Laptop")
laptop.addEventListener('click', () => {
  filtro = "category";
  filtroVal = "Laptop";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const celular = document.getElementById("Celular")
celular.addEventListener('click', () => {
  filtro = "category";
  filtroVal = "Celular";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const monitor = document.getElementById("Monitor")
monitor.addEventListener('click', () => {
  filtro = "category";
  filtroVal = "Monitor";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

// Buscar por precio menor o mayor: 
const menorPrice = document.getElementById("MenorPre")
menorPrice.addEventListener('click', () => {
  sort = "1";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const mayorPrice = document.getElementById("MayorPre")
mayorPrice.addEventListener('click', () => {
  sort = "-1";
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

// Limit: 
const limitInput = document.getElementById("limit");
limitInput.addEventListener('input', () => {
  limit = limitInput.value
  filtrarProducts(limit, page, sort, filtro, filtroVal);

})

// Limpiar filtros: 
const limpiarFiltros = document.getElementById("Limpiar");

limpiarFiltros.addEventListener('click', () => {
  limitInput.value = "";
  limit = 10;
  page = 1;
  sort = 1;
  filtro = null;
  filtroVal = null;
  filtrarProducts(limit, page, sort, filtro, filtroVal);
});

// Cambiar de página:
function cambiarPagina(currentPage, newPage) {

  let newCurrentPage;

  if (newPage === "prev") {
    newCurrentPage = currentPage - 1;
  }

  if (newPage === "next") {
    newCurrentPage = currentPage + 1;
  }

  filtrarProducts(limit, newCurrentPage, sort, filtro, filtroVal);

};

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