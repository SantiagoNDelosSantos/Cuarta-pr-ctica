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
            <th>Usuario</th>
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
function deleteMessage(messageId) {
  if (messageId) {
    fetch(`/api/chat/${messageId}`, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        if (data.statusCode === 500 || data.statusCode === 404) {
          Swal.fire({
            title: 'Error',
            text: data.message || 'Hubo un problema al eliminar el mensaje.',
            icon: 'error',
          });
        } else if (data.statusCode === 403) {
          Swal.fire({
            title: 'Advertencia',
            text: data.message || 'El mensaje no pudo ser eliminado.',
            icon: 'warning',
          });
        } else if (data.statusCode === 200) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            title: data.message || 'El mensaje fue eliminado con éxito.',
            icon: 'success'
          });
        }
      })
      .catch(error => {
        Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el mensaje: ' + error,
          icon: 'error',
        });
      });
  }
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
function enviarMensaje() {
  // Obtenemos el firstName del usuario:
  fetch('/api/sessions/current')
    .then((response) => response.json())
    .then((data) => {

      const userName = data.name;
      const userID = data.userId;
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

        // Enviar el mensaje al servidor:
        fetch('/api/chat/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
          .then(response => response.json())
          .then(data => {
            if (data.statusCode === 500) {
              Swal.fire({
                title: 'Error',
                text: data.message || 'Hubo un problema al intentar enviar el mensaje.',
                icon: 'error',
              });
            } else if (data.statusCode === 200) {
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                title: data.message || `Mensaje enviado.`,
                icon: 'success'
              });
              // Limpiar los campos de entrada:
              messageInput.value = "";
            }
          })
          .catch((error) => {
            console.error("Error al enviar el mensaje: " + error.message);
          });
      } else {
        // Muestra un Sweet Alert si el mensaje está vacío:
        Swal.fire({
          icon: 'error',
          title: 'Mensaje vacío',
          text: 'Por favor, ingresa un mensaje antes de enviarlo.',
        });
      }
    })
    .catch((error) => {
      console.error("Error al obtener el nombre de usuario: " + error.message);
    });

}