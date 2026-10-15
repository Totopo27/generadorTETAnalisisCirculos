import React from 'react';
import { calculateFontSize, calculateCurvature, getInversionPairs } from '../utils/tet-math';

export interface TETInversionGridProps {
    divisions: number;
    startIndex: number;
    endIndex: number;
    circlesPerRow?: number;
    svgRef?: React.Ref<SVGSVGElement>;
}

export const TETInversionGrid: React.FC<TETInversionGridProps> = ({
    divisions,
    startIndex,
    endIndex,
    circlesPerRow = 7,
    svgRef
}) => {
    const numCircles = Math.max(0, endIndex - startIndex + 1);
    const numRows = Math.ceil(numCircles / circlesPerRow);

    const circleRadius = 45;
    const innerCircleRadius = 38;
    const tickInnerRadius = 41;
    const numbersRadius = 55;
    const circleSpacing = 150;
    const rowSpacing = 185;

    const pageWidth = Math.max(800, circlesPerRow * circleSpacing + 80);
    const pageHeight = Math.max(500, 110 + numRows * rowSpacing);

    const angleStep = (2 * Math.PI) / divisions;
    const fontSize = calculateFontSize(divisions) * 0.95;

    return (
        <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width={pageWidth}
            height={pageHeight}
            viewBox={`0 0 ${pageWidth} ${pageHeight}`}
            className="overflow-visible select-none"
        >
            <defs>
                <style>{`
                    .grid-circle { fill: none; stroke: var(--circle-stroke, #fcfaff); stroke-width: 1.5; }
                    .grid-circle-dashed { fill: none; stroke: var(--circle-stroke, #fcfaff); stroke-width: 1; stroke-dasharray: 2,2; opacity: 0.3; }
                    .grid-tick { stroke: var(--tick-stroke, #fcfaff); stroke-width: 0.7; }
                    .grid-number { font-family: 'Segoe UI', system-ui, sans-serif; font-size: ${fontSize}px; text-anchor: middle; dominant-baseline: middle; fill: var(--text-svg, #fcfaff); }
                    .grid-title { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 11px; font-weight: bold; text-anchor: middle; fill: var(--text-svg, #fcfaff); }
                    .grid-page-title { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; fill: var(--text-svg, #fcfaff); }
                    .grid-mapping { fill: none; stroke: #3b82f6; stroke-width: 1; opacity: 0.75; }
                    .grid-fixed { fill: #ef4444; stroke: #ffffff; stroke-width: 1; }
                `}</style>
            </defs>

            <text x={pageWidth / 2} y={35} className="grid-page-title">
                {divisions}-TET: Inversiones Simétricas (Suma de Índices)
            </text>

            {Array.from({ length: numCircles }, (_, idx) => {
                const indexSum = startIndex + idx;
                const row = Math.floor(idx / circlesPerRow);
                const col = idx % circlesPerRow;

                const circlesInThisRow = Math.min(circlesPerRow, numCircles - row * circlesPerRow);
                const rowStartX = (pageWidth - circlesInThisRow * circleSpacing) / 2 + circleSpacing / 2;

                const x = rowStartX + col * circleSpacing;
                const y = 110 + row * rowSpacing;

                const { pairs, fixedPoints } = getInversionPairs(divisions, indexSum);

                return (
                    <g key={`inversion-${indexSum}`} transform={`translate(${x}, ${y})`}>
                        <text x={0} y={-68} className="grid-title">
                            Suma = {indexSum}
                        </text>

                        {/* Mapeos */}
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

                        {/* Puntos fijos */}
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
