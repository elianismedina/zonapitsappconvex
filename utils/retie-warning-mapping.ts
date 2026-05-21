/**
 * RETIE Warning to Recommendations Mapping (Spanish)
 * 
 * Maps technical warnings to user-friendly recommendations and actions
 */

export interface WarningRecommendation {
  title: string;
  description: string;
  actions: string[];
  severity: 'warning' | 'critical' | 'info';
  relatedArticles: string[];
}

export const retieWarningMapping: Record<string, WarningRecommendation> = {
  // Voltage Drop Warnings
  'AC_VOLTAGE_DROP_EXCEEDS': {
    title: 'Caída de voltaje AC muy alta',
    description: 'La caída de voltaje en los cables AC es superior al límite permitido de 3% según RETIE. Esto significa que la energía se pierde en el camino desde el inversor a tu hogar.',
    actions: [
      'Aumentar el calibre del cable AC (usar un diámetro más grande)',
      'Reducir la distancia entre el inversor y el panel eléctrico (si es posible)',
      'Considerar un inversor con mayor voltaje de salida',
      'Contactar con un instalador certificado para replantear la ubicación del inversor',
    ],
    severity: 'warning',
    relatedArticles: ['RETIE 41.2', 'IEC 60228'],
  },
  
  'DC_VOLTAGE_DROP_EXCEEDS': {
    title: 'Caída de voltaje DC muy alta',
    description: 'La caída de voltaje en los cables DC (desde los paneles al inversor) es superior al límite de 3%. Esto reduce la eficiencia de tu sistema solar.',
    actions: [
      'Aumentar el calibre del cable DC de los paneles',
      'Reducir el número de paneles en serie (usar más strings)',
      'Acortar la distancia entre los paneles y el inversor',
      'Verificar que todos los conectores estén limpios y bien ajustados',
    ],
    severity: 'warning',
    relatedArticles: ['RETIE 41.2', 'RETIE 42.2'],
  },
  
  // Compatibility Warnings
  'INVERTER_NOT_COMPATIBLE': {
    title: 'Inversor no compatible con los paneles',
    description: 'Los paneles solares seleccionados no funcionan correctamente con el inversor. Esto puede causar que el sistema no genere la energía esperada o no pase la inspección RETIE.',
    actions: [
      'Seleccionar un inversor diferente que tenga mayor voltaje nominal (Voc)',
      'Reducir el número de paneles en serie',
      'Aumentar el número de strings (líneas paralelas) de paneles',
      'Consultar con un ingeniero solar las limitaciones del inversor',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 42.1.3', 'RETIE 42.1.4'],
  },
  
  'BATTERY_NOT_COMPATIBLE': {
    title: 'Batería no compatible con el inversor',
    description: 'La batería que seleccionaste no es compatible con el inversor. Esto podría dañar la batería o el inversor durante la operación.',
    actions: [
      'Seleccionar una batería con el voltaje correcto (48V, 24V o 12V según el inversor)',
      'Verificar la capacidad de carga/descarga del inversor coincida con la batería',
      'Considerar usar baterías en serie o paralelo para alcanzar el voltaje requerido',
      'Consultar las especificaciones técnicas del inversor antes de comprar la batería',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 42.2.2', 'RETIE 42.2.3'],
  },
  
  // Temperature & Derating Warnings
  'BATTERY_TEMPERATURE_DERATING': {
    title: 'Alta pérdida de capacidad de batería por temperatura',
    description: 'En el clima cálido de Colombia (40°C), tu batería funcionará a solo el 88% de su capacidad nominal. Esto significa que necesitarás más capacidad de batería de la que parece.',
    actions: [
      'Aumentar la capacidad de la batería (Ah) para compensar la pérdida por temperatura',
      'Instalar ventilación o refrigeración activa en el área de la batería',
      'Ubicar la batería en un lugar sombreado y bien ventilado',
      'Considerar baterías diseñadas para climas tropicales (con mejor tolerancia térmica)',
      'Revisar regularmente la temperatura de la batería (no debe exceder 45°C)',
    ],
    severity: 'warning',
    relatedArticles: ['RETIE 42.2.1', 'IEC 62446'],
  },
  
  // Protection Device Warnings
  'BREAKER_SIZE_VIOLATION': {
    title: 'Tamaño del interruptor incorrecto',
    description: 'El interruptor automático no cumple con la regla RETIE del 125% de la corriente máxima. Esto podría no proteger adecuadamente contra sobrecargas.',
    actions: [
      'Cambiar el interruptor por uno que cumpla la regla del 125%',
      'Verificar que el tamaño del cable sea compatible con el nuevo interruptor',
      'Usar las clasificaciones estándar RETIE: 15A, 20A, 25A, 30A, 40A, 50A, etc.',
      'Solicitar a un instalador certificado que verifique los cálculos',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 16.2', 'RETIE 42.2.5'],
  },
  
  'FUSE_SIZE_VIOLATION': {
    title: 'Tamaño del fusible incorrecto',
    description: 'Los fusibles DC no cumplen con la regla RETIE del 156% de la corriente Isc de la string. Esto no protegerá adecuadamente contra fallas en los paneles.',
    actions: [
      'Cambiar los fusibles por unos que cumplan la regla del 156% de Isc',
      'Usar fusibles gG (de propósito general) con clasificación de al menos 600V DC',
      'Verificar que haya un fusible en cada string de paneles',
      'Reemplazar todos los fusibles al mismo tiempo',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 16.3', 'RETIE 42.2.4'],
  },
  
  // Grounding Warnings
  'INSUFFICIENT_GROUNDING': {
    title: 'Sistema de puesta a tierra insuficiente',
    description: 'El sistema de tierra tiene una resistencia muy alta o no cumple con RETIE. Una puesta a tierra deficiente es un riesgo de seguridad y causa problemas de compatibilidad electromagnética.',
    actions: [
      'Instalar mínimo 2 varillas de cobre de 2.4 metros separadas 3 metros entre sí',
      'Medir la resistencia de tierra (debe ser ≤ 25 Ω)',
      'Si la medición es > 25 Ω, agregar más varillas o mejorar el conductor de tierra',
      'Usar un medidor de resistencia de tierra (telurómetro) para verificar',
      'Conectar todos los marcos metálicos y equipos a la varilla de tierra',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 27.2', 'RETIE 42.3.4'],
  },
  
  // System Configuration Warnings
  'PANEL_OVERSIZE_NEEDED': {
    title: 'Sistema requiere más paneles para RETIE',
    description: 'El clima tropical de Colombia (calor y polvo) reduce la eficiencia de los paneles. Necesitarás más paneles que lo que muestra el cálculo estándar para garantizar que tu sistema produzca lo esperado.',
    actions: [
      'Aumentar el número de paneles solares (típicamente 15-20% más)',
      'Distribuir los paneles en strings adicionales para mantener voltajes seguros',
      'Considerar el costo adicional en el presupuesto del proyecto',
      'Esto es un requisito RETIE, no una recomendación opcional',
    ],
    severity: 'warning',
    relatedArticles: ['RETIE 42.1.1', 'IEC 62446'],
  },
  
  // Compliance & Documentation
  'RETIE_COMPLIANCE_CANNOT_BE_ASSURED': {
    title: 'No se puede garantizar el cumplimiento RETIE',
    description: 'Hay problemas en la configuración del sistema que impiden cumplir con los requisitos técnicos de RETIE. Tu sistema no pasará la inspección oficial.',
    actions: [
      'Revisar todas las advertencias anteriores y aplicar las recomendaciones',
      'Contactar con un ingeniero solar o instalador certificado',
      'Ajustar los componentes (paneles, inversor, batería, cables) según las normas',
      'Realizar un nuevo cálculo de dimensionamiento después de los cambios',
      'Solicitar una pre-inspección antes de la inspección oficial',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 42', 'RETIE 44'],
  },
  
  // Grid-Connected System Warnings
  'GRID_INTERCONNECT_REQUIRED': {
    title: 'Se requiere desconexión de interconexión a la red',
    description: 'Como tu sistema está conectado a la red eléctrica, necesitas un dispositivo de desconexión especial entre tu inversor y el medidor de la empresa de servicios. Este es un requisito de seguridad para proteger a los trabajadores de la red.',
    actions: [
      'Instalar un desconectador de interconexión a la red (de al menos 125% de la corriente del inversor)',
      'Asegurarse de que el desconectador esté entre el inversor y el medidor de la empresa',
      'Obtener la aprobación de la empresa de servicios eléctricos antes de conectar',
      'Verificar que el inversor tenga protección anti-islanding activada',
    ],
    severity: 'critical',
    relatedArticles: ['RETIE 42.1.2', 'RETIE 44.1'],
  },
};

/**
 * Find matching recommendations for a warning message
 */
export function findRecommendationForWarning(warningMessage: string): WarningRecommendation | null {
  // Try exact matches first
  if (warningMessage in retieWarningMapping) {
    return retieWarningMapping[warningMessage as keyof typeof retieWarningMapping];
  }
  
  // Try partial matches with keywords
  const lowerWarning = warningMessage.toLowerCase();
  
  if (lowerWarning.includes('ac voltage drop')) {
    return retieWarningMapping['AC_VOLTAGE_DROP_EXCEEDS'];
  }
  if (lowerWarning.includes('dc voltage drop')) {
    return retieWarningMapping['DC_VOLTAGE_DROP_EXCEEDS'];
  }
  if (lowerWarning.includes('inverter') && lowerWarning.includes('compatible')) {
    return retieWarningMapping['INVERTER_NOT_COMPATIBLE'];
  }
  if (lowerWarning.includes('battery') && lowerWarning.includes('compatible')) {
    return retieWarningMapping['BATTERY_NOT_COMPATIBLE'];
  }
  if (lowerWarning.includes('temperature') && lowerWarning.includes('battery')) {
    return retieWarningMapping['BATTERY_TEMPERATURE_DERATING'];
  }
  if (lowerWarning.includes('breaker')) {
    return retieWarningMapping['BREAKER_SIZE_VIOLATION'];
  }
  if (lowerWarning.includes('fuse')) {
    return retieWarningMapping['FUSE_SIZE_VIOLATION'];
  }
  if (lowerWarning.includes('ground') || lowerWarning.includes('puesta a tierra')) {
    return retieWarningMapping['INSUFFICIENT_GROUNDING'];
  }
  if (lowerWarning.includes('retie compliance cannot be assured')) {
    return retieWarningMapping['RETIE_COMPLIANCE_CANNOT_BE_ASSURED'];
  }
  if (lowerWarning.includes('grid') || lowerWarning.includes('red')) {
    return retieWarningMapping['GRID_INTERCONNECT_REQUIRED'];
  }
  
  return null;
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: 'warning' | 'critical' | 'info'): string {
  switch (severity) {
    case 'critical':
      return '#ef4444'; // red
    case 'warning':
      return '#f59e0b'; // amber
    case 'info':
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
}
