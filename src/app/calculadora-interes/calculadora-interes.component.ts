import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Campo {
  valor: number | null;
  esIncognita: boolean;
}

@Component({
  selector: 'app-calculadora-interes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora-interes.component.html',
  styleUrls: ['./calculadora-interes.component.css']
})
export class CalculadoraInteresComponent {
  tipoInteres: 'simple' | 'compuesto' = 'simple';
  
  campos: {
    C: Campo;
    i: Campo;
    n: Campo;
    m: Campo;
    M: Campo;
    I: Campo;
  } = {
    C: { valor: 10000, esIncognita: false },
    i: { valor: 5, esIncognita: false },
    n: { valor: 3, esIncognita: false },
    m: { valor: 1, esIncognita: false },
    M: { valor: null, esIncognita: false },
    I: { valor: null, esIncognita: true }
  };

  incognitaSeleccionada: string | null = 'I';
  formulaAUtilizar: string = 'I = C × i × n';
  resultado: number | null = null;
  mostrarResultado: boolean = false;
  mensaje: string = '';
  esError: boolean = false;
  detalleCalculo: string = '';

  onTipoInteresChange(): void {
    this.limpiar();
    // Establecer valores por defecto según el tipo de interés
    if (this.tipoInteres === 'simple') {
      this.campos.C.valor = 10000;
      this.campos.i.valor = 5;
      this.campos.n.valor = 3;
      this.campos.I.esIncognita = true;
      this.incognitaSeleccionada = 'I';
    } else {
      this.campos.C.valor = 10000;
      this.campos.i.valor = 8;
      this.campos.n.valor = 2;
      this.campos.m.valor = 12;
      this.campos.M.esIncognita = true;
      this.incognitaSeleccionada = 'M';
    }
    this.actualizarFormula();
  }

  onIncognitaChange(campo: string): void {
    // Solo permitir una incógnita a la vez
    if (this.campos[campo as keyof typeof this.campos].esIncognita) {
      Object.keys(this.campos).forEach(key => {
        if (key !== campo) {
          this.campos[key as keyof typeof this.campos].esIncognita = false;
        }
      });
      this.incognitaSeleccionada = campo;
      this.actualizarFormula();
    } else {
      this.incognitaSeleccionada = null;
      this.formulaAUtilizar = '';
    }
    this.mostrarResultado = false;
    this.mensaje = '';
  }

  actualizarFormula(): void {
    if (!this.incognitaSeleccionada) return;

    if (this.tipoInteres === 'simple') {
      switch (this.incognitaSeleccionada) {
        case 'C':
          this.formulaAUtilizar = 'C = I / (i × n)  o  C = M / (1 + i × n)';
          break;
        case 'i':
          this.formulaAUtilizar = 'i = I / (C × n)  o  i = (M/C - 1) / n';
          break;
        case 'n':
          this.formulaAUtilizar = 'n = I / (C × i)  o  n = (M/C - 1) / i';
          break;
        case 'I':
          this.formulaAUtilizar = 'I = C × i × n';
          break;
        case 'M':
          this.formulaAUtilizar = 'M = C × (1 + i × n)';
          break;
      }
    } else {
      // Interés compuesto
      switch (this.incognitaSeleccionada) {
        case 'C':
          this.formulaAUtilizar = 'C = M / (1 + i/m)^(n×m)';
          break;
        case 'i':
          this.formulaAUtilizar = 'i = m × ((M/C)^(1/(n×m)) - 1)';
          break;
        case 'n':
          this.formulaAUtilizar = 'n = ln(M/C) / (m × ln(1 + i/m))';
          break;
        case 'M':
          this.formulaAUtilizar = 'M = C × (1 + i/m)^(n×m)';
          break;
        case 'I':
          this.formulaAUtilizar = 'I = M - C,  donde  M = C × (1 + i/m)^(n×m)';
          break;
      }
    }
  }

  validarEntradas(): boolean {
    if (!this.incognitaSeleccionada) {
      this.mostrarMensaje('Debe seleccionar una incógnita a calcular', true);
      return false;
    }

    // Validar que se hayan ingresado los valores necesarios
    const camposRequeridos = this.tipoInteres === 'simple' 
      ? ['C', 'i', 'n']
      : ['C', 'i', 'n', 'm'];

    for (const campo of camposRequeridos) {
      const c = this.campos[campo as keyof typeof this.campos];
      if (!c.esIncognita && (c.valor === null || c.valor <= 0)) {
        this.mostrarMensaje(`El campo ${campo} debe ser un valor numérico positivo`, true);
        return false;
      }
    }

    // Validar que haya exactamente los valores necesarios (no incógnita)
    if (this.tipoInteres === 'simple') {
      // Para interés simple: necesitamos 3 de 4 valores (C, i, n, I o M)
      let valoresIngresados = 0;
      ['C', 'i', 'n'].forEach(campo => {
        if (!this.campos[campo as keyof typeof this.campos].esIncognita) {
          valoresIngresados++;
        }
      });
      
      // Verificar que al menos uno de I o M esté disponible
      const tieneI = this.campos.I.valor !== null && !this.campos.I.esIncognita;
      const tieneM = this.campos.M.valor !== null && !this.campos.M.esIncognita;
      
      if (this.incognitaSeleccionada === 'I' || this.incognitaSeleccionada === 'M') {
        if (valoresIngresados < 3) {
          this.mostrarMensaje('Debe ingresar C, i y n para calcular I o M', true);
          return false;
        }
      } else {
        if (!tieneI && !tieneM) {
          this.mostrarMensaje('Debe ingresar I o M además de los otros valores', true);
          return false;
        }
      }
    } else {
      // Para interés compuesto: necesitamos 4 de 5 valores
      let valoresIngresados = 0;
      Object.keys(this.campos).forEach(campo => {
        const c = this.campos[campo as keyof typeof this.campos];
        if (!c.esIncognita && c.valor !== null && c.valor > 0) {
          valoresIngresados++;
        }
      });
      
      if (valoresIngresados < 4) {
        this.mostrarMensaje('Debe ingresar al menos 4 valores para calcular la incógnita', true);
        return false;
      }
    }

    return true;
  }

  calcular(): void {
    if (!this.validarEntradas()) {
      return;
    }

    try {
      if (this.tipoInteres === 'simple') {
        this.calcularInteresSimple();
      } else {
        this.calcularInteresCompuesto();
      }
      
      this.mostrarResultado = true;
      this.mostrarMensaje('', false);
    } catch (error: any) {
      this.mostrarMensaje('Error al calcular: ' + error.message, true);
    }
  }

  calcularInteresSimple(): void {
    const C = this.campos.C.valor ?? 0;
    const i = (this.campos.i.valor ?? 0) / 100; // Convertir porcentaje a decimal
    const n = this.campos.n.valor ?? 0;
    const I = this.campos.I.valor ?? 0;
    const M = this.campos.M.valor ?? 0;

    switch (this.incognitaSeleccionada) {
      case 'C':
        if (I > 0) {
          // C = I / (i × n)
          this.resultado = I / (i * n);
          this.detalleCalculo = `C = I / (i × n) = ${I} / (${this.campos.i.valor}% × ${n}) = ${this.resultado.toFixed(2)}`;
        } else if (M > 0) {
          // C = M / (1 + i × n)
          this.resultado = M / (1 + i * n);
          this.detalleCalculo = `C = M / (1 + i × n) = ${M} / (1 + ${this.campos.i.valor}% × ${n}) = ${this.resultado.toFixed(2)}`;
        }
        break;
      
      case 'i':
        if (I > 0) {
          // i = I / (C × n)
          this.resultado = (I / (C * n)) * 100; // Convertir a porcentaje
          this.detalleCalculo = `i = I / (C × n) = ${I} / (${C} × ${n}) × 100 = ${this.resultado.toFixed(2)}%`;
        } else if (M > 0) {
          // i = (M/C - 1) / n
          this.resultado = ((M / C - 1) / n) * 100;
          this.detalleCalculo = `i = (M/C - 1) / n = ((${M}/${C}) - 1) / ${n} × 100 = ${this.resultado.toFixed(2)}%`;
        }
        break;
      
      case 'n':
        if (I > 0) {
          // n = I / (C × i)
          this.resultado = I / (C * i);
          this.detalleCalculo = `n = I / (C × i) = ${I} / (${C} × ${this.campos.i.valor}%) = ${this.resultado.toFixed(2)} años`;
        } else if (M > 0) {
          // n = (M/C - 1) / i
          this.resultado = (M / C - 1) / i;
          this.detalleCalculo = `n = (M/C - 1) / i = ((${M}/${C}) - 1) / ${this.campos.i.valor}% = ${this.resultado.toFixed(2)} años`;
        }
        break;
      
      case 'I':
        // I = C × i × n
        this.resultado = C * i * n;
        this.detalleCalculo = `I = C × i × n = ${C} × ${this.campos.i.valor}% × ${n} = ${this.resultado.toFixed(2)}`;
        break;
      
      case 'M':
        // M = C × (1 + i × n)
        this.resultado = C * (1 + i * n);
        this.detalleCalculo = `M = C × (1 + i × n) = ${C} × (1 + ${this.campos.i.valor}% × ${n}) = ${this.resultado.toFixed(2)}`;
        break;
    }
  }

  calcularInteresCompuesto(): void {
    const C = this.campos.C.valor ?? 0;
    const i = (this.campos.i.valor ?? 0) / 100; // Convertir porcentaje a decimal
    const n = this.campos.n.valor ?? 0;
    const m = this.campos.m.valor ?? 1;
    const M = this.campos.M.valor ?? 0;
    const I = this.campos.I.valor ?? 0;

    switch (this.incognitaSeleccionada) {
      case 'C':
        if (M > 0) {
          // C = M / (1 + i/m)^(n×m)
          this.resultado = M / Math.pow(1 + i / m, n * m);
          this.detalleCalculo = `C = M / (1 + i/m)^(n×m) = ${M} / (1 + ${this.campos.i.valor}%/${m})^(${n}×${m}) = ${this.resultado.toFixed(2)}`;
        } else if (I > 0) {
          // Necesitamos resolver iterativamente o usar M = C + I
          // Para simplificar, asumimos que el usuario debe dar M
          this.mostrarMensaje('Para calcular C, debe proporcionar M (Monto final)', true);
          return;
        }
        break;
      
      case 'i':
        if (M > 0) {
          // i = m × ((M/C)^(1/(n×m)) - 1)
          this.resultado = (m * (Math.pow(M / C, 1 / (n * m)) - 1)) * 100;
          this.detalleCalculo = `i = m × ((M/C)^(1/(n×m)) - 1) × 100 = ${m} × ((${M}/${C})^(1/(${n}×${m})) - 1) × 100 = ${this.resultado.toFixed(2)}%`;
        }
        break;
      
      case 'n':
        if (M > 0) {
          // n = ln(M/C) / (m × ln(1 + i/m))
          this.resultado = Math.log(M / C) / (m * Math.log(1 + i / m));
          this.detalleCalculo = `n = ln(M/C) / (m × ln(1 + i/m)) = ln(${M}/${C}) / (${m} × ln(1 + ${this.campos.i.valor}%/${m})) = ${this.resultado.toFixed(2)} años`;
        }
        break;
      
      case 'M':
        // M = C × (1 + i/m)^(n×m)
        this.resultado = C * Math.pow(1 + i / m, n * m);
        this.detalleCalculo = `M = C × (1 + i/m)^(n×m) = ${C} × (1 + ${this.campos.i.valor}%/${m})^(${n}×${m}) = ${this.resultado.toFixed(2)}`;
        break;
      
      case 'I':
        // I = M - C, donde M = C × (1 + i/m)^(n×m)
        const montoCalculado = C * Math.pow(1 + i / m, n * m);
        this.resultado = montoCalculado - C;
        this.detalleCalculo = `M = C × (1 + i/m)^(n×m) = ${C} × (1 + ${this.campos.i.valor}%/${m})^(${n}×${m}) = ${montoCalculado.toFixed(2)}\nI = M - C = ${montoCalculado.toFixed(2)} - ${C} = ${this.resultado.toFixed(2)}`;
        break;
    }
  }

  limpiar(): void {
    this.campos = {
      C: { valor: null, esIncognita: false },
      i: { valor: null, esIncognita: false },
      n: { valor: null, esIncognita: false },
      m: { valor: 1, esIncognita: false },
      M: { valor: null, esIncognita: false },
      I: { valor: null, esIncognita: false }
    };
    this.incognitaSeleccionada = null;
    this.formulaAUtilizar = '';
    this.resultado = null;
    this.mostrarResultado = false;
    this.mensaje = '';
    this.detalleCalculo = '';
    
    // Restablecer valores por defecto
    this.onTipoInteresChange();
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.esError = esError;
  }
}
