import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidosapiService } from '../pedidosapi.service';
import { PizzaDetalle } from '../pedido';

@Component({
  selector: 'app-captura-pedido',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './captura-pedido.html'
})
export class CapturaPedido {

  formulario: FormGroup;
  mensaje = signal('');

  tamanos = [
    { nombre: 'Chica', precio: 40 },
    { nombre: 'Mediana', precio: 80 },
    { nombre: 'Grande', precio: 120 }
  ];

  ingredientes = [
    { control: 'jamon', nombre: 'Jamón' },
    { control: 'pina', nombre: 'Piña' },
    { control: 'champinones', nombre: 'Champiñones' }
  ];

  precioIngrediente = 10;

  constructor(private fb: FormBuilder, public pedidos: PedidosapiService) {

    // Si ya hay datos del cliente capturados, se vuelven a mostrar
    const cliente = this.pedidos.datosCliente();

    this.formulario = this.fb.group({
      nombre_cliente: [cliente?.nombre_cliente ?? '', Validators.required],
      direccion: [cliente?.direccion ?? '', Validators.required],
      telefono: [cliente?.telefono ?? '', Validators.required],
      fecha_pedido: [cliente?.fecha_pedido ?? '', Validators.required],
      tamano: ['', Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      cantidad: [1, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
    });

  }

  campoInvalido(nombre: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  agregarPizza() {

    this.mensaje.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const v = this.formulario.value;

    const tamano = this.tamanos.find(t => t.nombre === v.tamano)!;
    const elegidos = this.ingredientes.filter(i => v[i.control]);
    const cantidad = Number(v.cantidad);

    const pizza: PizzaDetalle = {
      tamano: tamano.nombre,
      ingredientes: elegidos.map(i => i.nombre).join(', ') || 'Sin ingredientes',
      cantidad: cantidad,
      subtotal: (tamano.precio + elegidos.length * this.precioIngrediente) * cantidad
    };

    this.pedidos.guardarCliente({
      nombre_cliente: v.nombre_cliente,
      direccion: v.direccion,
      telefono: v.telefono,
      fecha_pedido: v.fecha_pedido
    });

    this.pedidos.agregarPizza(pizza);

    this.mensaje.set('Pizza agregada al pedido');

    this.formulario.patchValue({
      tamano: '',
      jamon: false,
      pina: false,
      champinones: false,
      cantidad: 1
    });

    this.formulario.get('tamano')?.markAsPristine();
    this.formulario.get('tamano')?.markAsUntouched();

  }

}