import React from 'react';
import { calculateFontSize, calculateCurvature, getInversionPairs } from '../utils/tet-math';

export interface TETInversionGridProps {
    divisions: number;
    startIndex: number;
    endIndex: number;
    circlesPerRow?: number;
    theme?: 'dark' | 'light';
    svgRef?: React.Ref<SVGSVGElement>;
}

export const TETInversionGrid: React.FC<TETInversionGridProps> = ({
    divisions,
    startIndex,
    endIndex,
    circlesPerRow = 7,
    theme = 'dark',
    svgRef
}) => {
    const numCircles = Math.max(0, endIndex - startIndex + 1);
    const numRows = Math.ceil(numCircles / circlesPerRow);

    const circleRadius = 58;
    const innerCircleRadius = 48;
    const tickInnerRadius = 52;
    const numbersRadius = 72;
    const circleSpacing = 210;
    const rowSpacing = 230;
    const startY = 170;

    const pageWidth = Math.max(960, circlesPerRow * circleSpacing + 80);
    const pageHeight = Math.max(540, startY + numRows * rowSpacing + 30);

    const isDark = theme === 'dark';
    const bgFill = isDark ? '#1e1e1e' : '#ffffff';
    const textFill = isDark ? '#fcfaff' : '#111827';
    const circleStroke = isDark ? '#fcfaff' : '#111827';
    const tickStroke = isDark ? '#fcfaff' : '#374151';

    const angleStep = (2 * Math.PI) / divisions;

    // Escala tipográfica adaptativa fina para que los números no se amontonen en 36+, 41+ y 53+ TET
    let fontSize = 7.5;
    if (divisions > 50) {
        fontSize = 5.2;
    } else if (divisions > 35) {
        fontSize = 6.2;
    } else if (divisions > 24) {
        fontSize = 7.0;
    } else {
        fontSize = calculateFontSize(divisions) * 0.85;
    }

    return (
        <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width={pageWidth}
            height={pageHeight}
            viewBox={`0 0 ${pageWidth} ${pageHeight}`}
            className="overflow-visible select-none rounded-xl"
        >
            <defs>
                <style>{`
                    .grid-circle { fill: none; stroke: ${circleStroke}; stroke-width: 1.5; }
                    .grid-circle-dashed { fill: none; stroke: ${circleStroke}; stroke-width: 1; stroke-dasharray: 2,2; opacity: 0.35; }
                    .grid-tick { stroke: ${tickStroke}; stroke-width: 0.8; }
                    .grid-number { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: ${fontSize}px; text-anchor: middle; dominant-baseline: middle; fill: ${textFill}; font-weight: 500; }
                    .grid-title { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: bold; text-anchor: middle; fill: ${textFill}; }
                    .grid-page-title { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 20px; font-weight: bold; text-anchor: middle; fill: ${textFill}; }
                    .grid-mapping { fill: none; stroke: #3b82f6; stroke-width: 1.2; opacity: 0.8; }
                    .grid-fixed { fill: #ef4444; stroke: ${isDark ? '#ffffff' : '#1e1e1e'}; stroke-width: 1; }
                `}</style>
            </defs>

            {/* Fondo sólido explícito para que el SVG descargado nunca salga en blanco */}
            <rect width="100%" height="100%" fill={bgFill} rx="12" />

            {/* Título de la página principal (con margen amplio) */}
            <text x={pageWidth / 2} y={45} className="grid-page-title">
                {divisions}-TET: Inversiones Simétricas (Suma de Índices)
            </text>

            {Array.from({ length: numCircles }, (_, idx) => {
                const indexSum = startIndex + idx;
                const row = Math.floor(idx / circlesPerRow);
                const col = idx % circlesPerRow;

                const circlesInThisRow = Math.min(circlesPerRow, numCircles - row * circlesPerRow);
                const rowStartX = (pageWidth - circlesInThisRow * circleSpacing) / 2 + circleSpacing / 2;

                const x = rowStartX + col * circleSpacing;
                const y = startY + row * rowSpacing;

                const { pairs, fixedPoints } = getInversionPairs(divisions, indexSum);

                return (
                    <g key={`inversion-${indexSum}`} transform={`translate(${x}, ${y})`}>
                        {/* Título de cada círculo individual (con margen de 85px respecto al centro) */}
                        <text x={0} y={-85} className="grid-title">
                            Suma = {indexSum}
                        </text>

                        {/* Mapeos de inversión */}
                        {pairs.map(([i, partner]) => {
                            const angle1 = -Math.PI / 2 + i * angleStep;
                            const angle2 = -Math.PI / 2 + partner * angleStep;
                            const x1 = circleRadius * Math.cos(angle1);
                            const y1 = circleRadius * Math.sin(angle1);
                            const x2 = circleRadius * Math.cos(angle2);
                            const y2 = circleRadius * Math.sin(angle2);
                            const { cx, cy } = calculateCurvature(i, partner, divisions, circleRadius);

                            return (
                                <path
                                    key={`pair-${indexSum}-${i}-${partner}`}
                                    d={`M ${x1.toFixed(2)},${y1.toFixed(2)} Q ${cx.toFixed(2)},${cy.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`}
                                    className="grid-mapping"
                                />
                            );
                        })}

                        {/* Puntos fijos de inversión */}
                        {fixedPoints.map(point => {
                            const angle = -Math.PI / 2 + point * angleStep;
                            const px = circleRadius * Math.cos(angle);
                            const py = circleRadius * Math.sin(angle);
                            return (
                                <circle
                                    key={`fixed-${indexSum}-${point}`}
                                    cx={px}
                                    cy={py}
                                    r={3.5}
                                    className="grid-fixed"
                                />
                            );
                        })}

                        {/* Círculos concéntricos */}
                        <circle cx={0} cy={0} r={circleRadius} className="grid-circle" />
                        <circle cx={0} cy={0} r={innerCircleRadius} className="grid-circle-dashed" />

                        {/* Ticks y números */}
                        {Array.from({ length: divisions }, (_, i) => {
                            const angle = -Math.PI / 2 + i * angleStep;
                            const tickX1 = circleRadius * Math.cos(angle);
                            const tickY1 = circleRadius * Math.sin(angle);
                            const tickX2 = tickInnerRadius * Math.cos(angle);
                            const tickY2 = tickInnerRadius * Math.sin(angle);

                            const numX = numbersRadius * Math.cos(angle);
                            const numY = numbersRadius * Math.sin(angle);

                            return (
                                <g key={`grid-deg-${indexSum}-${i}`}>
                                    <line
                                        x1={tickX1.toFixed(2)}
                                        y1={tickY1.toFixed(2)}
                                        x2={tickX2.toFixed(2)}
                                        y2={tickY2.toFixed(2)}
                                        className="grid-tick"
                                    />
                                    <text
                                        x={numX.toFixed(2)}
                                        y={numY.toFixed(2)}
                                        className="grid-number"
                                    >
                                        {i}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </svg>
    );
};
