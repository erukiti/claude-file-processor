import { describe, it, expect } from 'vitest';
import { AppError, FileOperationError, ValidationError } from './errors';

describe('errors', () => {
  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('test error');
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('test error');
    });
  });

  describe('FileOperationError', () => {
    it('should create FileOperationError with correct properties', () => {
      const error = new FileOperationError('read failed', 'test.txt');
      expect(error.name).toBe('FileOperationError');
      expect(error.path).toBe('test.txt');
      expect(error.message).toBe('File operation failed at test.txt: read failed');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('invalid input');
    });
  });
});