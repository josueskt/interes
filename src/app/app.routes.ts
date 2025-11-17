import { Routes } from '@angular/router';
import { CalculadoraInteresComponent } from './calculadora-interes/calculadora-interes.component';

export const routes: Routes = [
  { path: '', component: CalculadoraInteresComponent },
  { path: 'calculadora', component: CalculadoraInteresComponent }
];
