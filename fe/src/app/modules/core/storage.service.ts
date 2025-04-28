import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  setItem(key: string, value: unknown): void {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      this.storage.setItem(key, data);
    } catch (error) {
      console.error(`Failed to set item "${key}" in storage:`, error);
    }
  }

  getItem<T = unknown>(key: string, parseJson = true): T | string | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return null;
      return parseJson ? (JSON.parse(item) as T) : item;
    } catch (error) {
      console.error(
        `Failed to get or parse item "${key}" from storage:`,
        error
      );
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item "${key}" from storage:`, error);
    }
  }
}
