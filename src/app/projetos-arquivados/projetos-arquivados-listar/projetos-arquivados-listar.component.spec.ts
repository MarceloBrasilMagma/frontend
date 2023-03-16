import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetosArquivadosListarComponent } from './projetos-arquivados-listar.component';

describe('ProjetosArquivadosListarComponent', () => {
  let component: ProjetosArquivadosListarComponent;
  let fixture: ComponentFixture<ProjetosArquivadosListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetosArquivadosListarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetosArquivadosListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
