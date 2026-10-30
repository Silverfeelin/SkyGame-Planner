import '@app/extensions/array';
import { DateTime } from 'luxon';
import { GoalBucketKey, GoalHelper, GOAL_DAY_FORMAT, IGoalBucket, IGoalSavings } from './goal-helper';

describe('GoalHelper.project with savings', () => {
  const today = DateTime.fromISO('2026-01-10', { zone: 'UTC' });

  const savings = (id: string, c = 0, h = 0, ac = 0): IGoalSavings => ({ id, name: id, c, h, ac });
  const buckets = (c: IGoalBucket, h: IGoalBucket = { balance: 0, perDay: 0 }, ac: IGoalBucket = { balance: 0, perDay: 0 }) =>
    new Map<GoalBucketKey, IGoalBucket>([['c', c], ['h', h], ['ac', ac]]);

  it('is affordable when the balance covers it', () => {
    const [goal] = GoalHelper.project([savings('a', 100)], buckets({ balance: 200, perDay: 15 }), today).goals;
    expect(goal.id).toBe('a');
    expect(goal.status).toBe('affordable');
    expect(goal.days).toBe(0);
  });

  it('is projected from the daily income', () => {
    const [goal] = GoalHelper.project([savings('a', 300)], buckets({ balance: 200, perDay: 15 }), today).goals;
    expect(goal.status).toBe('projected');
    expect(goal.days).toBe(7);
  });

  it('waits for the savings above it', () => {
    const [, lower] = GoalHelper.project([savings('a', 150), savings('b', 150)], buckets({ balance: 200, perDay: 15 }), today).goals;
    expect(lower.days).toBe(7);
  });

  it('never completes without income for a short currency', () => {
    const [goal] = GoalHelper.project([savings('a', 0, 10)], buckets({ balance: 0, perDay: 15 }), today).goals;
    expect(goal.status).toBe('never');
    expect(goal.blockedBy).toEqual(['h']);
  });

  it('is pushed out by skipped days', () => {
    const skipped = new Set([today.plus({ days: 1 }).toFormat(GOAL_DAY_FORMAT), today.plus({ days: 2 }).toFormat(GOAL_DAY_FORMAT)]);
    const [goal] = GoalHelper.project([savings('a', 300)], buckets({ balance: 200, perDay: 15 }), today, skipped).goals;
    expect(goal.days).toBe(9);
  });

  it('counts towards the bucket totals', () => {
    const plan = GoalHelper.project([savings('a', 50, 4), savings('b', 25)], buckets({ balance: 0, perDay: 15 }, { balance: 0, perDay: 1 }), today);
    const needed = Object.fromEntries(plan.buckets.map(b => [b.key, b.needed]));
    expect(needed).toEqual({ c: 75, h: 4, ac: 0 });
  });
});
