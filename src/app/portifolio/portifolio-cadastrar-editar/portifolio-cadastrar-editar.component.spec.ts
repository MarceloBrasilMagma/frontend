import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortifolioCadastrarEditarComponent } from './portifolio-cadastrar-editar.component';

describe('PortifolioCadastrarEditarComponent', () => {
  let component: PortifolioCadastrarEditarComponent;
  let fixture: ComponentFixture<PortifolioCadastrarEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortifolioCadastrarEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortifolioCadastrarEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
