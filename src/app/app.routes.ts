import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pizzeria',
    children: [
      { path: 'nuevo-pedido', loadComponent: () => import('./pizzeria/captura-pedido/captura-pedido').then(c => c.CapturaPedido) },
      { path: 'detalle', loadComponent: () => import('./pizzeria/detalle-pedido/detalle-pedido').then(c => c.DetallePedido) },
      { path: 'ventas', loadComponent: () => import('./pizzeria/ventas/ventas').then(c => c.Ventas) }
    ]
  },
  { path: '', redirectTo: 'pizzeria/nuevo-pedido', pathMatch: 'full' },
  { path: '**', redirectTo: 'pizzeria/nuevo-pedido' }
];