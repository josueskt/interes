import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cuota {
  numero: number;
  cuotaTotal: number;
  capital: number;
  intereses: number;
  saldo: number;
}

@Component({
  selector: 'app-simulador-credito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simulador-credito.component.html',
  styleUrls: ['./simulador-credito.component.css']
})
export class SimuladorCreditoComponent {
  montoCredito: number = 50000;
  tasaInteres: number = 12;
  tiempoAnios: number = 2;
  pagosPorAnio: number = 12;
  tipoTabla: 'francesa' | 'alemana' = 'francesa';

  cuotas: Cuota[] = [];
  totalPagar: number = 0;
  totalIntereses: number = 0;
  numeroCuotas: number = 0;
  mostrarResultado: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  validarEntradas(): boolean {
    if (!this.montoCredito || this.montoCredito <= 0) {
      this.mostrarMensaje('El monto del crédito debe ser mayor a 0', true);
      return false;
    }

    if (!this.tasaInteres || this.tasaInteres <= 0) {
      this.mostrarMensaje('La tasa de interés debe ser mayor a 0', true);
      return false;
    }

    if (!this.tiempoAnios || this.tiempoAnios <= 0) {
      this.mostrarMensaje('El tiempo debe ser mayor a 0', true);
      return false;
    }

    if (!this.pagosPorAnio || this.pagosPorAnio <= 0) {
      this.mostrarMensaje('El número de pagos por año debe ser mayor a 0', true);
      return false;
    }

    return true;
  }

  calcular(): void {
    if (!this.validarEntradas()) {
      return;
    }

    this.numeroCuotas = Math.round(this.tiempoAnios * this.pagosPorAnio);
    
    if (this.tipoTabla === 'francesa') {
      this.calcularTablaFrancesa();
    } else {
      this.calcularTablaAlemana();
    }

    this.mostrarResultado = true;
    this.mostrarMensaje('', false);
  }

  calcularTablaFrancesa(): void {
    this.cuotas = [];
    
    // Tasa de interés por período
    const tasaPeriodo = (this.tasaInteres / 100) / this.pagosPorAnio;
    
    // Fórmula de cuota constante (Sistema Francés)
    // Cuota = C * [i(1+i)^n] / [(1+i)^n - 1]
    const factor = Math.pow(1 + tasaPeriodo, this.numeroCuotas);
    const cuotaConstante = this.montoCredito * (tasaPeriodo * factor) / (factor - 1);
    
    let saldo = this.montoCredito;
    this.totalPagar = 0;
    this.totalIntereses = 0;

    for (let i = 1; i <= this.numeroCuotas; i++) {
      // Los intereses se calculan sobre el saldo restante
      const intereses = saldo * tasaPeriodo;
      
      // El capital es la cuota menos los intereses
      let capital = cuotaConstante - intereses;
      
      // Ajuste para la última cuota (evitar saldos negativos por redondeo)
      if (i === this.numeroCuotas) {
        capital = saldo;
      }
      
      const cuotaTotal = capital + intereses;
      saldo -= capital;
      
      // Evitar saldos negativos por redondeo
      if (Math.abs(saldo) < 0.01) {
        saldo = 0;
      }

      this.cuotas.push({
        numero: i,
        cuotaTotal: cuotaTotal,
        capital: capital,
        intereses: intereses,
        saldo: saldo
      });

      this.totalPagar += cuotaTotal;
      this.totalIntereses += intereses;
    }
  }

  calcularTablaAlemana(): void {
    this.cuotas = [];
    
    // Tasa de interés por período
    const tasaPeriodo = (this.tasaInteres / 100) / this.pagosPorAnio;
    
    // Capital constante por cuota (Sistema Alemán)
    const capitalConstante = this.montoCredito / this.numeroCuotas;
    
    let saldo = this.montoCredito;
    this.totalPagar = 0;
    this.totalIntereses = 0;

    for (let i = 1; i <= this.numeroCuotas; i++) {
      // Los intereses se calculan sobre el saldo al inicio del período
      const intereses = saldo * tasaPeriodo;
      
      // El capital es constante
      const capital = capitalConstante;
      
      // La cuota total es capital + intereses
      const cuotaTotal = capital + intereses;
      
      // Actualizar saldo
      saldo -= capital;
      
      // Evitar saldos negativos por redondeo
      if (Math.abs(saldo) < 0.01) {
        saldo = 0;
      }

      this.cuotas.push({
        numero: i,
        cuotaTotal: cuotaTotal,
        capital: capital,
        intereses: intereses,
        saldo: saldo
      });

      this.totalPagar += cuotaTotal;
      this.totalIntereses += intereses;
    }
  }

  limpiar(): void {
    this.montoCredito = 50000;
    this.tasaInteres = 12;
    this.tiempoAnios = 2;
    this.pagosPorAnio = 12;
    this.tipoTabla = 'francesa';
    this.cuotas = [];
    this.totalPagar = 0;
    this.totalIntereses = 0;
    this.numeroCuotas = 0;
    this.mostrarResultado = false;
    this.mensaje = '';
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.esError = esError;
  }
}
