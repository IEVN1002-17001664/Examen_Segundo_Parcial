import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pizzeria } from './pizzeria';

describe('Pizzeria', () => {
  let component: Pizzeria;
  let fixture: ComponentFixture<Pizzeria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pizzeria],
    }).compileComponents();

    fixture = TestBed.createComponent(Pizzeria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
