import React from 'react';
import { calculateFontSize, calculateCurvature, getInversionPairs } from '../utils/tet-math';

export interface TETSingleCircleProps {
    divisions: number;
    indexSum?: number;
    showInversion?: boolean;
    title?: string;
    width?: number;
    height?: number;
    circleRadius?: number;
    innerCircleRadius?: number;
    numbersRadius?: number;
    tickInnerRadius?: number;
    theme?: 'dark' | 'light';
    svgRef?: React.Ref<SVGSVGElement>;
}

export const TETSingleCircle: React.FC<TETSingleCircleProps> = ({
    divisions,
    indexSum = 0,
    showInversion = false,
    title,
    width = 540,
    height = 540,
    circleRadius = 160,
    innerCircleRadius = 135,
    numbersRadius = 195,
    tickInnerRadius = 148,
    theme = 'dark',
    svgRef
}) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (2 * Math.PI) / divisions;
    const fontSize = calculateFontSize(divisions) * 1.55;
    const stepAngle = 360 / divisions;

    const isDark = theme === 'dark';
    const bgFill = isDark ? '#1e1e1e' : '#ffffff';
    const textFill = isDark ? '#fcfaff' : '#111827';
    const circleStroke = isDark ? '#fcfaff' : '#111827';
    const tickStroke = isDark ? '#fcfaff' : '#374151';

    const { pairs, fixedPoints } = showInversion
        ? getInversionPairs(divisions, indexSum)
        : { pairs: [], fixedPoints: [] };

    return (
        <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible select-none rounded-xl"
        >
            <defs>
                <style>{`
                    .tet-circle { fill: none; stroke: ${circleStroke}; stroke-width: 2; }
                    .tet-circle-dashed { fill: none; stroke: ${circleStroke}; stroke-width: 1.5; stroke-dasharray: 4,4; opacity: 0.35; }
                    .tet-tick { stroke: ${tickStroke}; stroke-width: 1.2; }
                    .tet-number { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: ${fontSize}px; text-anchor: middle; dominant-baseline: middle; fill: ${textFill}; font-weight: 600; }
                    .tet-title { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; fill: ${textFill}; }
                    .tet-subtitle { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 12px; text-anchor: middle; fill: ${textFill}; opacity: 0.8; }
                    .tet-mapping { fill: none; stroke: #3b82f6; stroke-width: 2.2; opacity: 0.85; }
                    .tet-fixed { fill: #ef4444; stroke: ${isDark ? '#ffffff' : '#1e1e1e'}; stroke-width: 1.5; }
                `}</style>
            </defs>

            {/* Fondo sólido explícito para que el SVG descargado nunca salga en blanco */}
            <rect width="100%" height="100%" fill={bgFill} rx="12" />

            {/* Título superior */}
            {title && (
                <text x={centerX} y={35} className="tet-title">
                    {title}
                </text>
            )}

            <g transform={`translate(${centerX}, ${centerY})`}>
                {/* Círculos base */}
                <circle cx={0} cy={0} r={circleRadius} className="tet-circle" />
                <circle cx={0} cy={0} r={innerCircleRadius} className="tet-circle-dashed" />

                {/* Mapeos de inversión (Curvas Bézier) */}
                {showInversion &&
                    pairs.map(([i, partner]) => {
                        const angle1 = -Math.PI / 2 + i * angleStep;
                        const angle2 = -Math.PI / 2 + partner * angleStep;
                        const x1 = circleRadius * Math.cos(angle1);
                        const y1 = circleRadius * Math.sin(angle1);
                        const x2 = circleRadius * Math.cos(angle2);
                        const y2 = circleRadius * Math.sin(angle2);
                        const { cx, cy } = calculateCurvature(i, partner, divisions, circleRadius);

                        return (
                            <path
                                key={`pair-${i}-${partner}`}
                                d={`M ${x1.toFixed(2)},${y1.toFixed(2)} Q ${cx.toFixed(2)},${cy.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`}
                                className="tet-mapping"
                            />
                        );
                    })}

                {/* Puntos fijos de inversión */}
                {showInversion &&
                    fixedPoints.map(point => {
                        const angle = -Math.PI / 2 + point * angleStep;
                        const x = circleRadius * Math.cos(angle);
                        const y = circleRadius * Math.sin(angle);
                        return (
                            <circle
                                key={`fixed-${point}`}
                                cx={x}
                                cy={y}
                                r={5}
                                className="tet-fixed"
                            />
                        );
                    })}

                {/* Ticks y etiquetas numéricas */}
                {Array.from({ length: divisions }, (_, i) => {
                    const angle = -Math.PI / 2 + i * angleStep;
                    const tickX1 = circleRadius * Math.cos(angle);
                    const tickY1 = circleRadius * Math.sin(angle);
                    const tickX2 = tickInnerRadius * Math.cos(angle);
                    const tickY2 = tickInnerRadius * Math.sin(angle);

                    const numX = numbersRadius * Math.cos(angle);
                    const numY = numbersRadius * Math.sin(angle);

                    return (
                        <g key={`deg-${i}`}>
                            <line
                                x1={tickX1.toFixed(2)}
                                y1={tickY1.toFixed(2)}
                                x2={tickX2.toFixed(2)}
                                y2={tickY2.toFixed(2)}
                                className="tet-tick"
                            />
                            <text
                                x={numX.toFixed(2)}
                                y={numY.toFixed(2)}
                                className="tet-number"
                            >
                                {i}
                            </text>
                        </g>
                    );
                })}
            </g>

            {/* Leyenda inferior */}
            <text x={centerX} y={height - 20} className="tet-subtitle">
                Paso: 360°/{divisions} ≈ {stepAngle.toFixed(3)}°
            </text>
        </svg>
    );
};
