import { tap, finalize } from 'rxjs/operators';

import { BaseDataSource } from '../../core/base.datasource';
import { ContactService } from './contact.service';

export class ContactDatasource extends BaseDataSource {
  constructor(private service: ContactService) {
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
