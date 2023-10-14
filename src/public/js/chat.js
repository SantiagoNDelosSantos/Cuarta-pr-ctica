// Ocultar la vista de carga después de 1 segundo (1000 milisegundos):
const carga = document.getElementById("VistaDeCarga");
const vista = document.getElementById("contenedorVista");

function pantallaCarga() {
  setTimeout(() => {
    carga.style = "display: none";
    vista.style = "display: block";
  }, 4000);
};
pantallaCarga();

// Iniciar Socket:
const socket = io();

// Capturas del DOM:
const chatTable = document.getElementById('chat-table');
const btnEnviar = document.getElementById('btnEnv');
const messageInput = document.getElementById("message");

// Escucha el evento "messages" enviado por el servidor:
socket.on("messages", (messageResult) => {

  if (messageResult !== null) {

    let htmlMessages = "";

    // Recorremos los mensajes y los mostramos en el HTML:
    htmlMessages += `
      <thead>
        <tr>
            <th>Usuarios</th>
            <th>Mensajes</th>
            <th>Date - Time</th>
            <th>Eliminar</th>
        </tr>
      </thead>`;

    messageResult.forEach((message) => {
      htmlMessages += `
      <tbody>
        <tr>
          <td>${message.user}</td>
          <td>${message.message}</td>
          <td>${message.time}</td>
          <td><button type="submit" class="btnDeleteSMS boton" id="Eliminar${message._id}">Eliminar</button></td>
        </tr>
      </tbody>`;
    });

    // Insertamos los mensajes en el HTML:
    chatTable.innerHTML = htmlMessages;

    // Agregar evento click al botón de eliminar:
    messageResult.forEach((message) => {
      const deleteButton = document.getElementById(`Eliminar${message._id}`);
      deleteButton.addEventListener("click", () => {
        deleteMessage(message._id);
      });
    });

  } else {
    let notMessages = "";
    notMessages += `<p style="margin-bottom: 1em;">No hay mensajes disponibles.</p>`;
    chatTable.innerHTML = notMessages;
    return;
  }

})

// Eliminar mensajes: 
async function deleteMessage(messageId) {

  try {

    const response = await fetch(`/api/chat/${messageId}`, {
      method: 'DELETE',
    })

    if (response.redirected) {
      const invalidTokenURL = response.url;
      window.location.replace(invalidTokenURL);
    }
  
    const res = await response.json();
    const statusCode = res.statusCode;
    const message = res.message;
    const customError = res.cause;

    if(statusCode === 401){
      Swal.fire({
        title: res.h1,
        text: res.message,
        imageUrl: res.img,
        imageWidth: 70,
        imageHeight: 70,
        imageAlt: res.h1,
      })
    } else if (statusCode === 200) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        title: message || 'El mensaje fue eliminado con éxito.',
        icon: 'success'
      });
    } else if (customError || statusCode === 403) {
      Swal.fire({
        icon: 'warning',
        title: 'Error al eliminar el mensaje',
        text: customError || message || 'Hubo un problema al eliminar el mensaje.',
      });
    } else if (statusCode === 404) {
      Swal.fire({
        icon: 'warning',
        title: 'Error al eliminar el mensaje',
        text: message || 'Hubo un problema al eliminar el mensaje.',
      });
    } else if (statusCode === 500) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar el mensaje',
        text: message || 'Hubo un problema al eliminar el mensaje.',
      });
    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud de eliminar mensaje',
      text: 'Error: ' + error.message
    });
  };

}

// Manejador para el evento de presionar la tecla "Enter" en el campo de mensaje:
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarMensaje();
  }
});

// Manejador para el evento de clic en el botón de enviar:
btnEnviar.addEventListener("click", () => {
  enviarMensaje();
});

// Función para enviar el mensaje al servidor:
async function enviarMensaje() {

  try {

    // Obtenemos el firstName del usuario:
    const response = await fetch('/api/sessions/current', {
      method: 'GET'
    })

    // Conseguimos la información necesaria para el mensaje:
    const res = await response.json();
    const userID = res.userId;
    const userName = res.name;
    const messageText = messageInput.value;

    // Verificamos que el mensaje no esté vacío antes de enviarlo:
    if (messageText.trim() !== "" || messageText.trim().length === 0) {

      // Crear el objeto de mensaje:
      const message = {
        user: userName,
        userId: userID,
        message: messageText,
        time: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString()
      };

      // Enviamos el mensaje:
      const responseEnv = await fetch('/api/chat/', {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const resEnv = await responseEnv.json();
      const statusCodeRes = resEnv.statusCode;
      const messageRes = resEnv.message;
      const customError = resEnv.message;

      if (statusCodeRes === 200) {
        messageInput.value = "";
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          title: messageRes || `Mensaje enviado.`,
          icon: 'success'
        });
      } else if (customError) {
        Swal.fire({
          icon: 'warning',
          title: 'Error al intentar enviar el mensaje',
          text: customError || 'Hubo un problema al intentar enviar el mensaje.',
        });
      } else if (statusCodeRes === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error al intentar enviar el mensaje',
          text: messageRes || 'Hubo un problema al intentar enviar el mensaje.',
        });
      }

    } else {
      // Muestra un Sweet Alert si el mensaje está vacío:
      Swal.fire({
        icon: 'error',
        title: 'Mensaje vacío',
        text: 'Por favor, ingresa un mensaje antes de enviarlo.',
      });
    };

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error en la solicitud de enviar mensaje',
      text: 'Error: ' + error.message
    });;
  }

};