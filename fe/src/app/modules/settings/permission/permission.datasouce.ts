import { tap, finalize } from 'rxjs/operators';
import { PermissionService } from './permission.service';
import { BaseDataSource } from '../../core/base.datasource';

export class PermissionDatasource extends BaseDataSource {
    constructor(private service: PermissionService) {
        super();
    }

    find(queryParams: any) {
        this.loadingSubject.next(true);
        this.subscriptions.subscribe = this.service.find(queryParams).pipe(
            tap((res: any) => {
                this.originalData = res;
                this.entitySubject.next(res.data);
                console.log(res.data);
                this.paginatorTotalSubject.next(res.total);
            }),
            // catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }
}
