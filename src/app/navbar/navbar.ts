import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PedidosapiService } from '../pizzeria/pedidosapi.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar {
  constructor(public pedidos: PedidosapiService) {}
}