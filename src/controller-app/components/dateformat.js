export const dayString = (day) => {
    switch (day.getDay()) {
        case 1:
        return 'Lunes'
          break;
        case 2:
        return 'Martes'
          break;
        case 3:
        return 'Miércoles'
          break;
        case 4:
        return 'Jueves'
          break;
        case 5:
        return 'Viernes'
          break;
        case 6:
        return 'Sábado'
          break;
        case 7:
        return 'Domingo'
          break;
        default:
          break;
      }
}

export const monthString = (day) => {
    switch (day.getUTCMonth()){
        case 0:
        return 'Enero'
            break;
        case 1:
        return 'Febrero'
            break;
        case 2:
        return 'Marzo'
            break;
        case 3:
        return 'Abril'
            break;
        case 4:
        return 'Mayo'
            break;
        case 5:
        return 'Junio'
            break;
        case 6:
        return 'Julio'
            break;
        case 7:
        return 'Agosto'
            break;
        case 8:
        return 'Septiembre'
            break;
        case 9:
        return 'Octubre'
            break;
        case 10:
        return 'Novimbre'
            break;
        case 10:
        return 'Dicimbre'
            break;
        default:
            break;
    }
}