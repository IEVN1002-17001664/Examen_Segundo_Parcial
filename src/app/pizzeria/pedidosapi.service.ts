import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido, PizzaDetalle } from './pedido';

export type DatosCliente = Omit<Pedido, 'detalle'>;

@Injectable({
  providedIn: 'root'
})
export class PedidosapiService {

  private url = 'http://127.0.0.1:5000/api/pedidos/';

  // Pedido en proceso (se conserva al cambiar de pestaña)
  pizzas = signal<PizzaDetalle[]>([]);
  datosCliente = signal<DatosCliente | null>(null);

  total = computed(() =>
    this.pizzas().reduce((suma, pizza) => suma + pizza.subtotal, 0)
  );

  constructor(private http: HttpClient) { }

  public guardarCliente(datos: DatosCliente) {
    this.datosCliente.set(datos);
  }

  public agregarPizza(pizza: PizzaDetalle) {
    this.pizzas.update(lista => [...lista, pizza]);
  }

  public quitarPizza(indice: number) {
    this.pizzas.update(lista => lista.filter((_, i) => i !== indice));
  }

  public limpiar() {
    this.pizzas.set([]);
    this.datosCliente.set(null);
  }

  public getPedidos(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  public getPedido(id_pedido: number): Observable<any> {
    return this.http.get<any>(this.url + id_pedido);
  }

  public agregarPedido(pedido: Pedido): Observable<any> {
    return this.http.post<any>(this.url, pedido);
  }

  public getVentasDia(dia: string): Observable<any> {
    return this.http.get<any>(this.url + 'ventas/dia/' + dia);
  }

  public getVentasMes(anio: number, mes: number): Observable<any> {
    return this.http.get<any>(this.url + 'ventas/mes/' + anio + '/' + mes);
  }

}