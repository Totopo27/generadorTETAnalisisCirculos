/**
 * src/utils/tet-math.ts
 * Aritmética modular y cálculos geométricos para círculos microtonales n-TET
 */

/**
 * Operación módulo matemática que maneja números negativos correctamente: ((n % m) + m) % m
 */
export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

/**
 * Determina el tamaño de fuente óptimo según la densidad angular del círculo
 */
export function calculateFontSize(divisions: number): number {
    if (divisions <= 20) return 12;
    if (divisions <= 30) return 10;
    if (divisions <= 40) return 8;
    if (divisions <= 50) return 7;
    return 6;
}

/**
 * Calcula las parejas de inversión (i, partner) y los puntos fijos para una suma de índices dada
 */
export function getInversionPairs(divisions: number, indexSum: number): {
    pairs: [number, number][];
    fixedPoints: number[];
} {
    const pairs: [number, number][] = [];
    const fixedPoints: number[] = [];
    const visited = new Set<number>();

    for (let i = 0; i < divisions; i++) {
        if (visited.has(i)) continue;

        const partner = mod(indexSum - i, divisions);

        if (partner === i) {
            fixedPoints.push(i);
            visited.add(i);
        } else if (!visited.has(partner)) {
            pairs.push([i, partner]);
            visited.add(i);
            visited.add(partner);
        }
    }

    return { pairs, fixedPoints };
}

/**
 * Calcula el punto de control para la curva cuadrática de Bézier que une dos puntos en el círculo
 */
export function calculateCurvature(
    i: number,
    partner: number,
    divisions: number,
    circleRadius: number
): { cx: number; cy: number } {
    const angleStep = (2 * Math.PI) / divisions;
    const angle1 = -Math.PI / 2 + (i * angleStep);
    const angle2 = -Math.PI / 2 + (partner * angleStep);

    let angularDist = Math.abs(partner - i);
    if (angularDist > divisions / 2) {
        angularDist = divisions - angularDist;
    }

    const normalizedDist = angularDist / (divisions / 2);
    const curvatureFactor = (1 - normalizedDist) * 0.6;

    // Calcular el ángulo medio sobre el arco más corto considerando el corte en 2pi
    let diff = ((angle2 - angle1 + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    const midAngle = angle1 + diff / 2;

    const controlRadius = circleRadius * curvatureFactor;

    return {
        cx: controlRadius * Math.cos(midAngle),
        cy: controlRadius * Math.sin(midAngle)
    };
}
