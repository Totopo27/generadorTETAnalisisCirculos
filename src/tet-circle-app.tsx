import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

// TET Circle Generator Class
class TETCircleGenerator {
    constructor(config = {}) {
        this.config = {
            svgWidth: 200,
            svgHeight: 200,
            centerX: 100,
            centerY: 100,
            circleRadius: 60,
            innerCircleRadius: 50,
            numbersRadius: 72,
            tickInnerRadius: 55,
            fontSize: this.calculateFontSize(config.divisions || 19),
            strokeWidth: 1.5,
            tickStrokeWidth: 0.5,
            mappingStrokeWidth: 0.8,
            mappingOpacity: 0.6,
            fixedPointRadius: 3,
            ...config
        };
    }

    calculateFontSize(divisions) {
        if (divisions <= 20) return 12;
        if (divisions <= 30) return 10;
        if (divisions <= 40) return 8;
        if (divisions <= 50) return 7;
        return 6;
    }

    generateBaseCircle(divisions, title = null) {
        const angleStep = (2 * Math.PI) / divisions;
        const { 
            svgWidth, svgHeight, centerX, centerY, 
            circleRadius, innerCircleRadius, numbersRadius, 
            tickInnerRadius, strokeWidth, tickStrokeWidth 
        } = this.config;

        this.config.fontSize = this.calculateFontSize(divisions);

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <defs>
    <style>
      .circle { fill: none; stroke: black; stroke-width: ${strokeWidth}; }
      .number { font-family: Arial, sans-serif; font-size: ${this.config.fontSize}px; text-anchor: middle; dominant-baseline: middle; }
      .title { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-anchor: middle; }
      .tick { stroke: black; stroke-width: ${tickStrokeWidth}; }
      .mapping { fill: none; stroke: blue; stroke-width: ${this.config.mappingStrokeWidth}; opacity: ${this.config.mappingOpacity}; }
      .fixed { fill: red; }
    </style>
  </defs>\n`;

        if (title) {
            svg += `  <text x="${centerX}" y="15" class="title">${title}</text>\n`;
        }

        svg += `  <g transform="translate(${centerX}, ${centerY})">\n`;
        svg += `    <circle cx="0" cy="0" r="${circleRadius}" class="circle"/>\n`;
        svg += `    <circle cx="0" cy="0" r="${innerCircleRadius}" class="circle" stroke-dasharray="2,2" opacity="0.3"/>\n`;
        
        for (let i = 0; i < divisions; i++) {
            const angle = -Math.PI/2 + (i * angleStep);
            
            const tickX1 = circleRadius * Math.cos(angle);
            const tickY1 = circleRadius * Math.sin(angle);
            const tickX2 = tickInnerRadius * Math.cos(angle);
            const tickY2 = tickInnerRadius * Math.sin(angle);
            
            const numX = numbersRadius * Math.cos(angle);
            const numY = numbersRadius * Math.sin(angle);
            
            svg += `    <line x1="${tickX1.toFixed(2)}" y1="${tickY1.toFixed(2)}" x2="${tickX2.toFixed(2)}" y2="${tickY2.toFixed(2)}" class="tick"/>\n`;
            svg += `    <text x="${numX.toFixed(2)}" y="${numY.toFixed(2)}" class="number">${i}</text>\n`;
        }
        
        svg += `  </g>\n`;
        
        const stepAngle = 360 / divisions;
        svg += `  <text x="${centerX}" y="${svgHeight - 10}" class="title" font-size="10">Step: 360°/${divisions} ≈ ${stepAngle.toFixed(3)}°</text>\n`;
        
        svg += `</svg>`;
        
        return svg;
    }

    generateInversionCircle(divisions, indexSum, title = null) {
        let svg = this.generateBaseCircle(divisions, title || `${divisions}-TET - Index Sum = ${indexSum}`);
        svg = svg.replace('  </g>\n  <text x=', this.generateMappings(divisions, indexSum) + '  </g>\n  <text x=');
        return svg;
    }

    generateMappings(divisions, indexSum) {
        const angleStep = (2 * Math.PI) / divisions;
        const { circleRadius } = this.config;
        let mappings = `    <!-- Mapping lines for Index Sum = ${indexSum} -->\n`;
        
        const mapped = new Set();
        
        for (let i = 0; i < divisions; i++) {
            if (mapped.has(i)) continue;
            
            let partner = (indexSum - i + divisions) % divisions;
            
            if (partner === i) {
                const angle = -Math.PI/2 + (i * angleStep);
                const x = circleRadius * Math.cos(angle);
                const y = circleRadius * Math.sin(angle);
                mappings += `    <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${this.config.fixedPointRadius}" class="fixed"/>\n`;
            } else if (!mapped.has(partner)) {
                const angle1 = -Math.PI/2 + (i * angleStep);
                const angle2 = -Math.PI/2 + (partner * angleStep);
                
                const x1 = circleRadius * Math.cos(angle1);
                const y1 = circleRadius * Math.sin(angle1);
                const x2 = circleRadius * Math.cos(angle2);
                const y2 = circleRadius * Math.sin(angle2);
                
                const curvature = this.calculateCurvature(i, partner, divisions);
                
                mappings += `    <path d="M ${x1.toFixed(2)},${y1.toFixed(2)} Q ${curvature.cx.toFixed(2)},${curvature.cy.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}" class="mapping"/>\n`;
                
                mapped.add(i);
                mapped.add(partner);
            }
        }
        
        return mappings;
    }

    calculateCurvature(i, partner, divisions) {
        const angleStep = (2 * Math.PI) / divisions;
        const angle1 = -Math.PI/2 + (i * angleStep);
        const angle2 = -Math.PI/2 + (partner * angleStep);
        
        let angularDist = Math.abs(partner - i);
        if (angularDist > divisions / 2) {
            angularDist = divisions - angularDist;
        }
        
        const normalizedDist = angularDist / (divisions / 2);
        const curvatureFactor = (1 - normalizedDist) * 0.6;
        
        const midAngle = (angle1 + angle2) / 2;
        const controlRadius = this.config.circleRadius * curvatureFactor;
        
        return {
            cx: controlRadius * Math.cos(midAngle),
            cy: controlRadius * Math.sin(midAngle)
        };
    }

    generateInversionPage(divisions, startIndex = 0, endIndex = null, circlesPerRow = 7) {
        if (endIndex === null) {
            endIndex = divisions - 1;
        }
        
        const numCircles = endIndex - startIndex + 1;
        const numRows = Math.ceil(numCircles / circlesPerRow);
        
        const circleSpacing = 157;
        const pageWidth = 1100;
        const pageHeight = 850;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">
  <defs>
    <style>
      .circle { fill: none; stroke: black; stroke-width: 1.5; }
      .number { font-family: Arial, sans-serif; font-size: ${this.calculateFontSize(divisions)}px; text-anchor: middle; dominant-baseline: middle; }
      .title { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; text-anchor: middle; }
      .page-title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; text-anchor: middle; }
      .tick { stroke: black; stroke-width: 0.5; }
      .mapping { fill: none; stroke: blue; stroke-width: 0.8; opacity: 0.6; }
      .fixed { fill: red; }
    </style>
  </defs>\n`;
        
        svg += `  <text x="${pageWidth/2}" y="25" class="page-title">${divisions}-TET Inversions (I_xy)</text>\n`;
        
        let circleIndex = 0;
        for (let row = 0; row < numRows; row++) {
            const circlesInThisRow = Math.min(circlesPerRow, numCircles - (row * circlesPerRow));
            const rowStartX = (pageWidth - (circlesInThisRow * circleSpacing)) / 2 + circleSpacing/2;
            
            for (let col = 0; col < circlesInThisRow; col++) {
                const indexSum = startIndex + circleIndex;
                if (indexSum > endIndex) break;
                
                const x = rowStartX + (col * circleSpacing);
                const y = 140 + (row * 200);
                
                const tempGen = new TETCircleGenerator({
                    ...this.config,
                    svgWidth: 150,
                    svgHeight: 150,
                    centerX: 0,
                    centerY: 0,
                    circleRadius: 50,
                    innerCircleRadius: 42,
                    numbersRadius: 60,
                    tickInnerRadius: 46
                });
                
                svg += `  <g transform="translate(${x}, ${y})">\n`;
                svg += `    <text x="0" y="-75" class="title">Index Sum = ${indexSum}</text>\n`;
                svg += tempGen.generateMappings(divisions, indexSum);
                
                const angleStep = (2 * Math.PI) / divisions;
                svg += `    <circle cx="0" cy="0" r="50" class="circle"/>\n`;
                svg += `    <circle cx="0" cy="0" r="42" class="circle" stroke-dasharray="2,2" opacity="0.3"/>\n`;
                
                for (let i = 0; i < divisions; i++) {
                    const angle = -Math.PI/2 + (i * angleStep);
                    const tickX1 = 50 * Math.cos(angle);
                    const tickY1 = 50 * Math.sin(angle);
                    const tickX2 = 46 * Math.cos(angle);
                    const tickY2 = 46 * Math.sin(angle);
                    const numX = 60 * Math.cos(angle);
                    const numY = 60 * Math.sin(angle);
                    
                    svg += `    <line x1="${tickX1.toFixed(2)}" y1="${tickY1.toFixed(2)}" x2="${tickX2.toFixed(2)}" y2="${tickY2.toFixed(2)}" class="tick"/>\n`;
                    svg += `    <text x="${numX.toFixed(2)}" y="${numY.toFixed(2)}" class="number">${i}</text>\n`;
                }
                
                svg += `  </g>\n`;
                circleIndex++;
            }
        }
        
        svg += `</svg>`;
        return svg;
    }
}

// React Component
export default function TETCircleApp() {
    const [mode, setMode] = useState('single');
    const [divisions, setDivisions] = useState(19);
    const [indexSum, setIndexSum] = useState(0);
    const [showInversion, setShowInversion] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(6);
    const [circlesPerRow, setCirclesPerRow] = useState(7);
    const [svgContent, setSvgContent] = useState('');

    const generator = new TETCircleGenerator();

    useEffect(() => {
        generateSVG();
    }, [mode, divisions, indexSum, showInversion, startIndex, endIndex, circlesPerRow]);

    const generateSVG = () => {
        let svg = '';
        if (mode === 'single') {
            if (showInversion) {
                svg = generator.generateInversionCircle(divisions, indexSum);
            } else {
                svg = generator.generateBaseCircle(divisions, `${divisions}-TET Circle`);
            }
        } else {
            svg = generator.generateInversionPage(divisions, startIndex, endIndex, circlesPerRow);
        }
        setSvgContent(svg);
    };

    const downloadSVG = () => {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${divisions}-TET-${mode}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
                    Generador de Círculos TET
                </h1>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mode Selection */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Modo de Visualización
                            </label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMode('single')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        mode === 'single'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Círculo Individual
                                </button>
                                <button
                                    onClick={() => setMode('multiple')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        mode === 'multiple'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Página Múltiple
                                </button>
                            </div>
                        </div>

                        {/* Divisions */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Divisiones (n-TET): {divisions}
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="72"
                                value={divisions}
                                onChange={(e) => setDivisions(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <input
                                type="number"
                                min="3"
                                max="72"
                                value={divisions}
                                onChange={(e) => setDivisions(parseInt(e.target.value))}
                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {mode === 'single' && (
                            <>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={showInversion}
                                            onChange={(e) => setShowInversion(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">
                                            Mostrar Inversión
                                        </span>
                                    </label>
                                </div>

                                {showInversion && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Suma de Índices: {indexSum}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max={divisions - 1}
                                            value={indexSum}
                                            onChange={(e) => setIndexSum(parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {mode === 'multiple' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Índice Inicial: {startIndex}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={divisions - 1}
                                        value={startIndex}
                                        onChange={(e) => setStartIndex(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Índice Final: {endIndex}
                                    </label>
                                    <input
                                        type="range"
                                        min={startIndex}
                                        max={divisions - 1}
                                        value={endIndex}
                                        onChange={(e) => setEndIndex(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Círculos por Fila: {circlesPerRow}
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        value={circlesPerRow}
                                        onChange={(e) => setCirclesPerRow(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={downloadSVG}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download size={20} />
                        Descargar SVG
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto">
                    <div
                        className="flex justify-center"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>
            </div>
        </div>
    );
}