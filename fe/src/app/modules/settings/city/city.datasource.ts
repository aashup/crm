import { tap, finalize } from 'rxjs/operators';
import { CityService } from './city.service';
import { BaseDataSource } from '../../core/base.datasource';

export class CityDatasource extends BaseDataSource {
    constructor(private service: CityService) {
        super();
    }

    find(queryParams: any) {
        this.loadingSubject.next(true);
        this.subscriptions.subscribe = this.service.find(queryParams).pipe(
            tap((res: any) => {
                this.originalData = res;
                this.entitySubject.next(res.data);
                this.paginatorTotalSubject.next(res.total);
            }),
            // catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }
}
