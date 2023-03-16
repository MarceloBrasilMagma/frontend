import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoAlteracoesComponent } from './historico-alteracoes.component';

describe('HistoricoAlteracoesComponent', () => {
  let component: HistoricoAlteracoesComponent;
  let fixture: ComponentFixture<HistoricoAlteracoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricoAlteracoesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoAlteracoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
