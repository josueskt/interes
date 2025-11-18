import { Routes } from '@angular/router';
import { CalculadoraInteresComponent } from './calculadora-interes/calculadora-interes.component';
import { SimuladorCreditoComponent } from './simulador-credito/simulador-credito.component';

export const routes: Routes = [
  { path: '', component: CalculadoraInteresComponent },
  { path: 'calculadora', component: CalculadoraInteresComponent },
  { path: 'credito', component: SimuladorCreditoComponent }
];
