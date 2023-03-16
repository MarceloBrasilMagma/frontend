import { NgModule } from '@angular/core';
import { DefaultRoutingModule } from './default-routing.module';
import { DefaultComponent } from './default.component';

@NgModule({
  imports: [DefaultRoutingModule],
  exports: [],
  declarations: [DefaultComponent],
})
export class DefaultModule {}
