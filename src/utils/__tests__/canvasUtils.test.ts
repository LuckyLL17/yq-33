import { describe, it, expect } from 'vitest';
import { seededRandom, hexToRgb, resolvePaperType } from '../canvasUtils';
import type { PaperType } from '@/types';

describe('canvasUtils - 纯函数单元测试', () => {
  describe('seededRandom', () => {
    it('应该返回一个函数', () => {
      const rand = seededRandom(123);
      expect(typeof rand).toBe('function');
    });

    it('相同种子应该生成相同的随机序列', () => {
      const rand1 = seededRandom(12345);
      const rand2 = seededRandom(12345);
      const values1 = Array.from({ length: 10 }, () => rand1());
      const values2 = Array.from({ length: 10 }, () => rand2());
      expect(values1).toEqual(values2);
    });

    it('不同种子应该生成不同的随机序列', () => {
      const rand1 = seededRandom(12345);
      const rand2 = seededRandom(54321);
      const values1 = Array.from({ length: 10 }, () => rand1());
      const values2 = Array.from({ length: 10 }, () => rand2());
      expect(values1).not.toEqual(values2);
    });

    it('生成的值应该在 [0, 1) 范围内', () => {
      const rand = seededRandom(999);
      for (let i = 0; i < 100; i++) {
        const value = rand();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('应该正确处理负种子', () => {
      const rand = seededRandom(-123);
      for (let i = 0; i < 10; i++) {
        const value = rand();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('应该正确处理零种子', () => {
      const rand = seededRandom(0);
      for (let i = 0; i < 10; i++) {
        const value = rand();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('应该正确处理大种子', () => {
      const rand = seededRandom(2147483647);
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('连续调用应该产生不同的值', () => {
      const rand = seededRandom(42);
      const values = new Set<number>();
      for (let i = 0; i < 100; i++) {
        values.add(rand());
      }
      expect(values.size).toBeGreaterThan(1);
    });
  });

  describe('hexToRgb', () => {
    it('应该正确转换 6 位十六进制颜色', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
    });

    it('应该正确转换不带 # 的 6 位十六进制颜色', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
    });

    it('应该正确转换 3 位十六进制颜色', () => {
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#00f')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('应该正确转换不带 # 的 3 位十六进制颜色', () => {
      expect(hexToRgb('f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('应该正确处理小写十六进制颜色', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#abcdef')).toEqual({ r: 171, g: 205, b: 239 });
    });

    it('应该正确处理大写十六进制颜色', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#ABCDEF')).toEqual({ r: 171, g: 205, b: 239 });
    });

    it('应该正确处理混合大小写十六进制颜色', () => {
      expect(hexToRgb('#AbCdEf')).toEqual({ r: 171, g: 205, b: 239 });
    });
  });

  describe('resolvePaperType', () => {
    it('应该正确映射已知的 paperId', () => {
      expect(resolvePaperType('blank')).toBe('blank' as PaperType);
      expect(resolvePaperType('line')).toBe('line' as PaperType);
      expect(resolvePaperType('grid')).toBe('grid' as PaperType);
      expect(resolvePaperType('squared')).toBe('grid' as PaperType);
      expect(resolvePaperType('notebook')).toBe('line' as PaperType);
      expect(resolvePaperType('kraft')).toBe('kraft' as PaperType);
      expect(resolvePaperType('newspaper')).toBe('blank' as PaperType);
      expect(resolvePaperType('dotted')).toBe('dotted' as PaperType);
    });

    it('对于未知的 paperId 应该返回默认值 line', () => {
      expect(resolvePaperType('unknown')).toBe('line' as PaperType);
      expect(resolvePaperType('')).toBe('line' as PaperType);
      expect(resolvePaperType('random-type')).toBe('line' as PaperType);
      expect(resolvePaperType('undefined')).toBe('line' as PaperType);
      expect(resolvePaperType('null')).toBe('line' as PaperType);
    });
  });
});
