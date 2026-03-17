import {
  calculateCommunityScore,
  calculatePerformanceScore,
  normalise,
  type TraderMetrics,
} from "./scoring";

describe("normalise", () => {
  test("returns 0 when value is at minimum", () => {
    expect(normalise(1, 1, 5)).toBe(0);
  });

  test("returns 1 when value is at maximum", () => {
    expect(normalise(5, 1, 5)).toBe(1);
  });

  test("clamps below minimum to 0", () => {
    expect(normalise(-10, 0, 100)).toBe(0);
  });

  test("clamps above maximum to 1", () => {
    expect(normalise(150, 0, 100)).toBe(1);
  });
});

describe("calculatePerformanceScore", () => {
  const base: TraderMetrics = {
    profitFactor: 1,
    winRate: 30,
    sharpeRatio: 0,
    maxDrawdown: 30,
    consistencyScore: 0,
  };

  test("profit factor at minimum contributes 0 from PF component", () => {
    const score = calculatePerformanceScore({
      ...base,
      profitFactor: 1,
      consistencyScore: 0,
      winRate: 30,
      sharpeRatio: 0,
      maxDrawdown: 30,
    });
    // All components at minimum -> 0 after rounding
    expect(score).toBe(0);
  });

  test("max drawdown at 0 gives full 10 points on DD component", () => {
    const score = calculatePerformanceScore({
      ...base,
      maxDrawdown: 0,
    });
    // Only DD component non-zero -> 10
    expect(score).toBe(10);
  });
});

describe("calculateCommunityScore", () => {
  test("returns 0 when there are no member metrics", () => {
    expect(calculateCommunityScore([], 0, 0)).toBe(0);
  });

  test("caps final community score at 100", () => {
    const traders: TraderMetrics[] = [
      {
        profitFactor: 5,
        winRate: 90,
        sharpeRatio: 4,
        maxDrawdown: 0,
        consistencyScore: 100,
      },
    ];
    const score = calculateCommunityScore(traders, 100, 1);
    expect(score).toBeLessThanOrEqual(100);
  });
});

