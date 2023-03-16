import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortifolioVisualizarComponent } from './portifolio-visualizar.component';

describe('PortifolioVisualizarComponent', () => {
  let component: PortifolioVisualizarComponent;
  let fixture: ComponentFixture<PortifolioVisualizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortifolioVisualizarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortifolioVisualizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
