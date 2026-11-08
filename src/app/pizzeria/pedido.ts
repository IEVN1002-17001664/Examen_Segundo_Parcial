export interface PizzaDetalle {
  tamano: string;
  ingredientes: string;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  nombre_cliente: string;
  direccion: string;
  telefono: string;
  fecha_pedido: string;
  detalle: PizzaDetalle[];
}