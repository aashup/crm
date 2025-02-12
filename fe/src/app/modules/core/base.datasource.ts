import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { SubscriptionHandler } from './subscription.handler';

export class BaseDataSource implements DataSource<any> {
    entitySubject = new BehaviorSubject<any[]>([]);
    hasItems: boolean = false; // Need to show message: 'No records found

    // Loading | Progress bar
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$: Observable<boolean>;
    originalData: any = {};

    // Paginator | Paginators count
    paginatorTotalSubject = new BehaviorSubject<number>(0);
    paginatorTotal$: Observable<number>;
    subscriptions = new SubscriptionHandler();

    constructor() {
        this.loading$ = this.loadingSubject.asObservable();
        this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
        this.subscriptions.subscribe = this.paginatorTotal$.subscribe(res => this.hasItems = res > 0);
    }

    connect(collectionViewer: CollectionViewer | null = null): Observable<any[]> {
        // Connecting data source
        return this.entitySubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // Disonnecting data source
        this.entitySubject.complete();
        this.loadingSubject.complete();
        this.paginatorTotalSubject.complete();
        this.subscriptions.unsubscribe();
    }

    sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'desc'): any[] {
        if (!_sortField) {
            return _incomingArray;
        }
        let result: any[] = [];
        result = _incomingArray.sort((a, b) => {
            if (a[_sortField] < b[_sortField]) {
                return _sortOrder === 'desc' ? -1 : 1;
            }
            if (a[_sortField] > b[_sortField]) {
                return _sortOrder === 'desc' ? 1 : -1;
            }
            return 0;
        });
        return result;
    }

    searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
        const result: any[] = [];
        let resultBuffer: any[] = [];
        const indexes: number[] = [];
        let firstIndexes: number[] = [];
        let doSearch: boolean = false;

        _filtrationFields.forEach(item => {
            if (item in _queryObj) {
                _incomingArray.forEach((element, index) => {
                    if (element[item] === _queryObj[item]) {
                        firstIndexes.push(index);
                    }
                });
                firstIndexes.forEach(element => {
                    resultBuffer.push(_incomingArray[element]);
                });
                _incomingArray = resultBuffer.slice(0);
                resultBuffer = [].slice(0);
                firstIndexes = [].slice(0);
            }
        });

        Object.keys(_queryObj).forEach(key => {
            const searchText = _queryObj[key].toString().trim().toLowerCase();
            if (key && !_.includes(_filtrationFields, key) && searchText) {
                doSearch = true;
                try {
                    _incomingArray.forEach((element, index) => {
                        const _val = element[key].toString().trim().toLowerCase();
                        if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
                            indexes.push(index);
                        }
                    });
                } catch (ex) {
                    console.log(ex, key, searchText);
                }
            }
        });

        if (!doSearch) {
            return _incomingArray;
        }

        indexes.forEach(re => {
            result.push(_incomingArray[re]);
        });

        return result;
    }
}
