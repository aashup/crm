import { tap, finalize } from 'rxjs/operators';
import { UnitConversionService } from './unitconversion.service';
import { BaseDataSource } from 'src/app/modules/core/base.datasource';

export class UnitConversionDatasource extends BaseDataSource {
    constructor(private service: UnitConversionService) {
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
