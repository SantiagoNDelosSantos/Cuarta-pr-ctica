// Captura tabla para crear prductos:
const newProductTable = document.getElementById('newProductTable');

// Captura tabla con productos publicados:
const yourProductsTable = document.getElementById('yourProductsTable');

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