import { tap, finalize } from 'rxjs/operators';
import { CustomersService } from './customers.service';
import { BaseDataSource } from '../../core/base.datasource';


export class CustomersDatasource extends BaseDataSource {
    constructor(private service: CustomersService) {
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
