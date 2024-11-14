import { describe, it, expect, vi } from 'vitest';
import { debugLog } from './debug';

describe('debug utils', () => {
  it('should output debug message with correct format', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const testMessage = 'test message';
    
    debugLog(testMessage);
    
    expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] test message');
    consoleSpy.mockRestore();
  });
});