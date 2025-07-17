import { tap, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../core/base.datasource';
import { UsersService } from './users.service';

export class UsersDatasource extends BaseDataSource {
  constructor(private service: UsersService) {
    super();
  }

  find(queryParams: any) {
    this.loadingSubject.next(true);
    this.subscriptions.subscribe = this.service
      .find(queryParams)
      .pipe(
        tap((res: any) => {
          this.originalData = res;
          this.entitySubject.next(res.data);
          this.paginatorTotalSubject.next(res.total);
        }),
        // catchError(err => of(new QueryResultsModel([], err))),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }
}
