const productos = [
    { id: 1, nombre: "Remera", precio: 15000 },
    { id: 2, nombre: "Pantalon", precio: 25000 },
    { id: 3, nombre: "Zapatillas", precio: 50000 },
    { id: 4, nombre: "Buzo", precio: 35000 },
    { id: 5, nombre: "Gorra", precio: 10000 }
];

function obtenerDatos(clave) {
    let datos = localStorage.getItem(clave);
    if (datos) {
        return JSON.parse(datos);
    }
    return [];
}

let carrito = obtenerDatos("carrito");
let pedidos = obtenerDatos("pedidos");

function mostrarProductos(lista = productos) {
    let contenedor = document.getElementById("lista-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    lista.forEach(function(producto) {
        contenedor.innerHTML += `
            <div class="producto">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            </div>
        `;
    });
}

let buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("input", function() {
        let texto = buscador.value.toLowerCase();
        let resultado = productos.filter(function(producto) {
            return producto.nombre.toLowerCase().includes(texto);
        });
        mostrarProductos(resultado);
    });
}

function agregarAlCarrito(id) {
    let productoEncontrado = productos.find(function(producto) {
        return producto.id === id;
    });

    if (!productoEncontrado) return;

    let productoExistente = carrito.find(function(producto) {
        return producto.id === id;
    });

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            ...productoEncontrado,
            cantidad: 1
        });
    }

    guardarCarrito();
    alert("Producto agregado al carrito");
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function mostrarCarrito() {
    let listaCarrito = document.getElementById("lista-carrito");
    let total = document.getElementById("total");
    if (!listaCarrito) return;

    listaCarrito.innerHTML = "";
    let precioTotal = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p>El carrito esta vacio.</p>";
    }

    carrito.forEach(function(producto, indice) {
        let subtotal = producto.precio * producto.cantidad;
        precioTotal += subtotal;

        listaCarrito.innerHTML += `
            <div class="producto-carrito">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <p>Subtotal: $${subtotal}</p>
                <button onclick="cambiarCantidad(${indice}, -1)">-</button>
                <button onclick="cambiarCantidad(${indice}, 1)">+</button>
                <button onclick="eliminarDelCarrito(${indice})">Eliminar</button>
            </div>
        `;
    });

    if (total) {
        total.textContent = "Total: $" + precioTotal;
    }
}

function cambiarCantidad(indice, cantidad) {
    carrito[indice].cantidad += cantidad;

    if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
    }

    guardarCarrito();
    mostrarCarrito();
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    mostrarCarrito();
}

let formulario = document.getElementById("formulario-compra");
if (formulario) {
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        if (carrito.length === 0) {
            alert("El carrito esta vacio.");
            return;
        }

        if (!formulario.checkValidity()) {
            formulario.reportValidity();
            return;
        }

        let datosFormulario = new FormData(formulario);

        let nuevoPedido = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString(),
            nombre: datosFormulario.get("nombre"),
            email: datosFormulario.get("email"),
            telefono: datosFormulario.get("telefono"),
            productos: [...carrito],
            total: carrito.reduce(function(acumulador, producto) {
                return acumulador + producto.precio * producto.cantidad;
            }, 0)
        };

        pedidos.push(nuevoPedido);
        localStorage.setItem("pedidos", JSON.stringify(pedidos));
        
        carrito = [];
        guardarCarrito();
        formulario.reset();

        alert("¡Compra realizada correctamente!");
        window.location.href = "pedidos.html";
    });
}

function mostrarPedidos() {
    let listaPedidos = document.getElementById("lista-pedidos");
    if (!listaPedidos) return;

    listaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<p>Todavia no hiciste pedidos.</p>";
        return;
    }

    pedidos.forEach(function(pedido) {
        let detalleProductos = "";
        pedido.productos.forEach(function(producto) {
            detalleProductos += `<p>${producto.nombre} x ${producto.cantidad}</p>`;
        });

        listaPedidos.innerHTML += `
            <div class="pedido">
                <h3>Pedido ${pedido.id}</h3>
                <p>Fecha: ${pedido.fecha}</p>
                <p>Cliente: ${pedido.nombre}</p>
                ${detalleProductos}
                <h4>Total: $${pedido.total}</h4>
                <button onclick="eliminarPedido(${pedido.id})">Eliminar pedido</button>
            </div>
        `;
    });
}

function eliminarPedido(id) {
    pedidos = pedidos.filter(function(pedido) {
        return pedido.id !== id;
    });
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

if (formulario) {
    let campos = formulario.querySelectorAll("input, select, textarea");
    campos.forEach(function(campo) {
        campo.addEventListener("input", function() {
            if (campo.checkValidity()) {
                campo.classList.remove("invalido");
                campo.classList.add("valido");
            } else {
                campo.classList.remove("valido");
                campo.classList.add("invalido");
            }
        });
    });
}

mostrarProductos();
mostrarCarrito();
mostrarPedidos();