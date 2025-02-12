import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({ providedIn: 'root' })
export class StorageService {
    disk = 'localStorage';

    setItem(name: string, payload: any): void {
        if (_.isString(payload)) {
            window[this.disk].setItem(name, payload);
        } else {
            window[this.disk].setItem(name, JSON.stringify(payload))
        }
    }

    getItem(name: string, parse: boolean = true) {
        if (parse) {
            try {
                return JSON.parse(window[this.disk].getItem(name))
            } catch (error) {
                return false;
            }
        } else {
            return window[this.disk].getItem(name)
        }
    }

    removeItem(name: string) {
        return window[this.disk].removeItem(name)
    }
}
