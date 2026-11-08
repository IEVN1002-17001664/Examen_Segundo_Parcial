import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidosapiService } from '../pedidosapi.service';

@Component({
  selector: 'app-detalle-pedido',
  imports: [RouterLink],
  templateUrl: './detalle-pedido.html'
})
export class DetallePedido {

  mensaje = signal('');
  error = signal('');
  enviando = signal(false);

  constructor(public pedidos: PedidosapiService) { }

  quitarPizza(indice: number) {
    this.pedidos.quitarPizza(indice);
  }

  terminarPedido() {

    const cliente = this.pedidos.datosCliente();
    const pizzas = this.pedidos.pizzas();

    if (cliente === null || pizzas.length === 0) {
      this.error.set('Captura los datos del cliente y agrega por lo menos una pizza');
      return;
    }

    this.mensaje.set('');
    this.error.set('');
    this.enviando.set(true);

    this.pedidos.agregarPedido({ ...cliente, detalle: pizzas }).subscribe({
      next: (respuesta) => {

        if (respuesta.exito) {
          this.mensaje.set(
            respuesta.mensaje + '. Total a pagar: $' + respuesta.total
          );
          this.pedidos.limpiar();
        } else {
          this.error.set(respuesta.mensaje);
        }

        this.enviando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err.error?.mensaje || 'Error al registrar el pedido');
        this.enviando.set(false);
      }
    });

  }

}