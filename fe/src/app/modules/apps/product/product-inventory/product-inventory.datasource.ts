import { tap, finalize } from 'rxjs/operators';
import { BaseDataSource } from 'src/app/modules/core/base.datasource';
import { ProductInventoryService } from './product-inventory.service';
import { Observable } from 'rxjs';



export class ProductInventoryDatasource extends BaseDataSource {
    constructor(private service: ProductInventoryService) {
        super();
    }

    find(queryParams: any): Observable<any> {
        this.loadingSubject.next(true);
        return this.service.find(queryParams).pipe(
            tap((res: any) => {
                this.originalData = res;
                this.entitySubject.next(res.data);
                this.paginatorTotalSubject.next(res.total);
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }
}
