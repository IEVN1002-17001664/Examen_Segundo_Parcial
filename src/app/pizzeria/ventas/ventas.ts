import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidosapiService } from '../pedidosapi.service';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule],
  templateUrl: './ventas.html'
})
export class Ventas {

  pestana = signal<'dia' | 'mes' | 'detalle'>('dia');
  error = signal('');

  dias = [
    { valor: 'lunes', nombre: 'Lunes' },
    { valor: 'martes', nombre: 'Martes' },
    { valor: 'miercoles', nombre: 'Miércoles' },
    { valor: 'jueves', nombre: 'Jueves' },
    { valor: 'viernes', nombre: 'Viernes' },
    { valor: 'sabado', nombre: 'Sábado' },
    { valor: 'domingo', nombre: 'Domingo' }
  ];

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Valores de los campos
  dia: string = '';
  mes: string = '';
  anio: number = new Date().getFullYear();
  idPedido: number | null = null;

  // Resultados
  ventasDia = signal<any[]>([]);
  totalDia = signal(0);

  ventasMes = signal<any[]>([]);
  totalMes = signal(0);

  pedidoSeleccionado = signal<any>(null);

  constructor(private pedidosapi: PedidosapiService) { }

  cambiarPestana(pestana: 'dia' | 'mes' | 'detalle') {
    this.error.set('');
    this.pestana.set(pestana);
  }

  claseTab(pestana: string): string {
    return this.pestana() === pestana
      ? 'inline-block rounded-t-lg border-b-2 border-blue-600 p-4 text-blue-600'
      : 'inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600';
  }

  consultarDia() {

    this.error.set('');

    if (!this.dia) {
      this.error.set('Selecciona un día de la semana');
      return;
    }

    this.pedidosapi.getVentasDia(this.dia).subscribe({
      next: (respuesta) => {
        this.ventasDia.set(respuesta.ventas || []);
        this.totalDia.set(respuesta.total_dia || 0);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al consultar las ventas del día');
      }
    });

  }

  consultarMes() {

    this.error.set('');

    if (!this.mes || !this.anio) {
      this.error.set('Selecciona un mes e indica el año');
      return;
    }

    this.pedidosapi.getVentasMes(Number(this.anio), Number(this.mes)).subscribe({
      next: (respuesta) => {
        this.ventasMes.set(respuesta.ventas || []);
        this.totalMes.set(respuesta.total_mes || 0);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al consultar las ventas del mes');
      }
    });

  }

  verDetalle(id: number) {
    this.idPedido = id;
    this.pestana.set('detalle');
    this.consultarDetalle();
  }

  consultarDetalle() {

    this.error.set('');

    if (!this.idPedido || this.idPedido <= 0) {
      this.error.set('Ingresa un número de pedido válido');
      return;
    }

    this.pedidosapi.getPedido(this.idPedido).subscribe({
      next: (respuesta) => {
        this.pedidoSeleccionado.set(respuesta);
      },
      error: (err) => {
        console.error(err);
        this.pedidoSeleccionado.set(null);
        this.error.set('No se encontró el pedido');
      }
    });

  }

}