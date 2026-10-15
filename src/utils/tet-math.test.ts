import test from 'node:test';
import assert from 'node:assert/strict';
import {
    mod,
    getInversionPairs,
    calculateCurvature,
    calculateFontSize
} from './tet-math';

test('mod: aritmética modular matemática precisa', () => {
    assert.equal(mod(5, 12), 5);
    assert.equal(mod(0, 19), 0);
    assert.equal(mod(19, 19), 0);
    assert.equal(mod(-3, 12), 9, 'Enteros negativos deben envolver hacia adelante');
    assert.equal(mod(-1, 19), 18);
    assert.equal(mod(-25, 12), 11);
});

test('getInversionPairs: partición exacta y puntos fijos en 12-TET', () => {
    // En 12-TET con suma de índices = 0:
    // Puntos fijos: 0 y 6 (tritono)
    // Parejas: (1, 11), (2, 10), (3, 9), (4, 8), (5, 7)
    const { pairs, fixedPoints } = getInversionPairs(12, 0);

    assert.deepEqual(fixedPoints.sort((a, b) => a - b), [0, 6]);
    assert.equal(pairs.length, 5);

    // Verificar que todas las 12 notas están contabilizadas sin duplicados
    const allPitches = [...fixedPoints, ...pairs.flat()].sort((a, b) => a - b);
    assert.deepEqual(allPitches, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    // Verificar que cada pareja suma indexSum mod 12
    pairs.forEach(([a, b]) => {
        assert.equal(mod(a + b, 12), 0);
    });
});

test('getInversionPairs: partición exacta en temperamentos impares (19-TET)', () => {
    // En 19-TET (impar), con suma = 0 sólo 0 es punto fijo
    const { pairs, fixedPoints } = getInversionPairs(19, 0);

    assert.deepEqual(fixedPoints, [0]);
    assert.equal(pairs.length, 9); // 9 parejas = 18 notas + 1 fija = 19

    const allPitches = [...fixedPoints, ...pairs.flat()].sort((a, b) => a - b);
    assert.equal(allPitches.length, 19);

    pairs.forEach(([a, b]) => {
        assert.equal(mod(a + b, 19), 0);
    });
});

test('calculateCurvature: curvatura Bézier finita y centro en antípodas', () => {
    const radius = 100;
    // Puntos antípodas (distancia angular máxima = N/2 en 12-TET: 0 y 6)
    const antipodal = calculateCurvature(0, 6, 12, radius);
    assert.ok(Math.abs(antipodal.cx) < 0.001, 'cx debe estar en el centro para puntos diametrales');
    assert.ok(Math.abs(antipodal.cy) < 0.001, 'cy debe estar en el centro para puntos diametrales');

    // Puntos adyacentes (0 y 1 en 19-TET)
    const adjacent = calculateCurvature(0, 1, 19, radius);
    assert.ok(!isNaN(adjacent.cx));
    assert.ok(!isNaN(adjacent.cy));
    assert.ok(isFinite(adjacent.cx));
    assert.ok(isFinite(adjacent.cy));
});

test('calculateFontSize: escala tipográfica adaptativa', () => {
    assert.equal(calculateFontSize(12), 12);
    assert.equal(calculateFontSize(19), 12);
    assert.equal(calculateFontSize(25), 10);
    assert.equal(calculateFontSize(31), 8);
    assert.equal(calculateFontSize(41), 7);
    assert.equal(calculateFontSize(53), 6);
    assert.equal(calculateFontSize(72), 6);
});
