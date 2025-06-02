// app/core/services/app-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppState {
  [key: string]: any;
}

export class AppStateManager {
  private state = new BehaviorSubject<AppState>({});
  readonly state$ = this.state.asObservable();

  set<T>(key: string, value: T): void {
    const current = this.state.getValue();
    this.state.next({ ...current, [key]: value });
  }

  get<T>(key: string): T | undefined {
    return this.state.getValue()[key];
  }

  clear(key: string): void {
    const { [key]: _, ...rest } = this.state.getValue();
    this.state.next(rest);
  }

  reset(): void {
    this.state.next({});
  }

  complete(): void {
    return this.state.complete()
  }
}
