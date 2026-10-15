import React, { useState, useEffect, useRef } from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import { TETSingleCircle } from './components/TETSingleCircle';
import { TETInversionGrid } from './components/TETInversionGrid';

export default function TETCircleApp() {
    const [mode, setMode] = useState<'single' | 'multiple'>('single');
    const [divisions, setDivisions] = useState<number>(19);
    const [indexSum, setIndexSum] = useState<number>(0);
    const [showInversion, setShowInversion] = useState<boolean>(false);
    const [startIndex, setStartIndex] = useState<number>(0);
    const [endIndex, setEndIndex] = useState<number>(6);
    const [circlesPerRow, setCirclesPerRow] = useState<number>(7);

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
        }
        return 'dark';
    });

    const svgRef = useRef<SVGSVGElement>(null);

    // Sincronizar tema con body y localStorage
    useEffect(() => {
        const root = window.document.body;
        if (theme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Blindaje de estado: clampear índices cuando cambia divisions
    useEffect(() => {
        setIndexSum(prev => Math.min(prev, Math.max(0, divisions - 1)));
        setStartIndex(prev => Math.min(prev, Math.max(0, divisions - 1)));
        setEndIndex(prev => {
            const clamped = Math.min(prev, Math.max(0, divisions - 1));
            return Math.max(clamped, startIndex);
        });
    }, [divisions]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    // Descarga nativa y limpia del SVG usando XMLSerializer (sin inyecciones de strings)
    const downloadSVG = () => {
        if (!svgRef.current) return;
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svgRef.current);
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${divisions}-TET-${mode}${mode === 'single' && showInversion ? `-sum-${indexSum}` : ''}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDivisionsChange = (val: number) => {
        const clamped = Math.min(72, Math.max(3, isNaN(val) ? 3 : val));
        setDivisions(clamped);
    };

    return (
        <div className="min-h-screen bg-main text-text-main p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-accent">
                            Generador de Círculos TET
                        </h1>
                        <p className="text-sm opacity-80 mt-1">
                            Análisis de simetrías, suma de índices y mapas de inversión en temperamentos iguales
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-button-bg hover:bg-button-hover-bg text-accent transition-all border border-accent shadow-sm"
                        aria-label="Alternar tema claro/oscuro"
                    >
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                </div>

                {/* Panel de Configuración */}
                <div className="bg-panel-bg backdrop-blur-md rounded-xl shadow-xl p-6 mb-8 border border-accent">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Selector de modo */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-main">
                                Modo de Visualización
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMode('single')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        mode === 'single'
                                            ? 'bg-accent text-white shadow-md'
                                            : 'bg-button-bg text-text-main hover:bg-button-hover-bg border border-accent/30'
                                    }`}
                                >
                                    Círculo Individual
                                </button>
                                <button
                                    onClick={() => setMode('multiple')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        mode === 'multiple'
                                            ? 'bg-accent text-white shadow-md'
                                            : 'bg-button-bg text-text-main hover:bg-button-hover-bg border border-accent/30'
                                    }`}
                                >
                                    Página Múltiple
                                </button>
                            </div>
                        </div>

                        {/* Selector de divisiones n-TET */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-text-main">
                                    Divisiones (n-TET): <span className="text-accent">{divisions}</span>
                                </label>
                                <span className="text-xs opacity-75">3 a 72</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="72"
                                value={divisions}
                                onChange={e => handleDivisionsChange(parseInt(e.target.value, 10))}
                                className="w-full accent-accent cursor-pointer"
                            />
                            <input
                                type="number"
                                min="3"
                                max="72"
                                value={divisions}
                                onChange={e => handleDivisionsChange(parseInt(e.target.value, 10))}
                                className="mt-2 w-full px-3 py-1.5 border border-accent rounded-lg bg-input-bg text-input-text font-semibold text-center"
                            />
                        </div>

                        {/* Controles para modo individual */}
                        {mode === 'single' && (
                            <div className="flex flex-col justify-center space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showInversion}
                                        onChange={e => setShowInversion(e.target.checked)}
                                        className="w-5 h-5 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="text-sm font-semibold text-text-main select-none">
                                        Mostrar Mapeo de Inversión
                                    </span>
                                </label>

                                {showInversion && (
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span>Suma de Índices (I_xy):</span>
                                            <span className="text-accent">{indexSum}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={Math.max(0, divisions - 1)}
                                            value={indexSum}
                                            onChange={e => setIndexSum(parseInt(e.target.value, 10))}
                                            className="w-full accent-accent cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Controles para modo múltiple */}
                        {mode === 'multiple' && (
                            <>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span>Rango de Suma:</span>
                                        <span className="text-accent">{startIndex} a {endIndex}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[11px] opacity-75">Inicio</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={endIndex}
                                                value={startIndex}
                                                onChange={e => setStartIndex(Math.max(0, Math.min(parseInt(e.target.value, 10) || 0, endIndex)))}
                                                className="w-full px-2 py-1 border border-accent rounded bg-input-bg text-input-text text-center text-sm"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] opacity-75">Fin</span>
                                            <input
                                                type="number"
                                                min={startIndex}
                                                max={divisions - 1}
                                                value={endIndex}
                                                onChange={e => setEndIndex(Math.min(divisions - 1, Math.max(parseInt(e.target.value, 10) || 0, startIndex)))}
                                                className="w-full px-2 py-1 border border-accent rounded bg-input-bg text-input-text text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span>Círculos por fila:</span>
                                        <span className="text-accent">{circlesPerRow}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        value={circlesPerRow}
                                        onChange={e => setCirclesPerRow(parseInt(e.target.value, 10))}
                                        className="w-full accent-accent cursor-pointer"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Botón de Descarga */}
                    <button
                        onClick={downloadSVG}
                        className="mt-6 w-full md:w-auto md:min-w-[240px] bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
                    >
                        <Download size={20} />
                        Descargar SVG Vectorial
                    </button>
                </div>

                {/* Área de Visualización Vectorial React Nativa */}
                <div className="bg-panel-bg backdrop-blur-md rounded-xl shadow-xl p-6 overflow-auto border border-accent flex justify-center items-center min-h-[500px]">
                    {mode === 'single' ? (
                        <TETSingleCircle
                            svgRef={svgRef}
                            divisions={divisions}
                            indexSum={indexSum}
                            showInversion={showInversion}
                            title={`${divisions}-TET ${showInversion ? `(Inversión Suma = ${indexSum})` : 'Círculo Base'}`}
                            width={520}
                            height={520}
                            circleRadius={160}
                            innerCircleRadius={135}
                            numbersRadius={195}
                            tickInnerRadius={148}
                        />
                    ) : (
                        <TETInversionGrid
                            svgRef={svgRef}
                            divisions={divisions}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            circlesPerRow={circlesPerRow}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
