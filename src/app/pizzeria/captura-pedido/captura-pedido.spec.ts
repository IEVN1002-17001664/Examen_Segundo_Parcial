import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturaPedido } from './captura-pedido';

describe('CapturaPedido', () => {
  let component: CapturaPedido;
  let fixture: ComponentFixture<CapturaPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapturaPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(CapturaPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
