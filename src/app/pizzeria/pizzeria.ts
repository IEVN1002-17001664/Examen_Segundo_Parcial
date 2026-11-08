import { Component } from '@angular/core';
import { CapturaPedido } from './captura-pedido/captura-pedido';
import { DetallePedido } from './detalle-pedido/detalle-pedido';
import { Ventas } from './ventas/ventas';
import { PedidosapiService } from './pedidosapi.service';
import { Pedido, PizzaDetalle } from './pedido';

@Component({
  selector: 'app-pizzeria',
  standalone: true,
  imports: [CapturaPedido, DetallePedido, Ventas],
  templateUrl: './pizzeria.html'
})
export class Pizzeria {

  pizzas: PizzaDetalle[] = [];

  datosCliente: Omit<Pedido, 'detalle'> | null = null;

  constructor(private pedidosapi: PedidosapiService) { }

  guardarDatosCliente(datos: Omit<Pedido, 'detalle'>) {
    this.datosCliente = datos;
  }

  agregarPizza(pizza: PizzaDetalle) {
    this.pizzas.push(pizza);
  }

  quitarPizza(indice: number) {
    this.pizzas.splice(indice, 1);
  }

  terminarPedido() {

    if (this.pizzas.length === 0 || this.datosCliente === null) {
      alert('Completa los datos y agrega por lo menos una pizza');
      return;
    }

    const pedido: Pedido = {
      ...this.datosCliente,
      detalle: this.pizzas
    };

    this.pedidosapi.agregarPedido(pedido).subscribe({
      next: (respuesta) => {

        if (respuesta.exito) {

          alert(
            respuesta.mensaje +
            '\nTotal a pagar: $' + respuesta.total
          );

          this.pizzas = [];
          this.datosCliente = null;

        } else {
          alert(respuesta.mensaje);
        }

      },
      error: (error) => {
        console.error(error);
        alert('Error al registrar el pedido');
      }
    });

  }

}