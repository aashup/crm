import { tap, finalize } from 'rxjs/operators';
import { BaseDataSource } from '../../core/base.datasource';
import { UnitConversionService } from './unitconversion.service';
import { Observable } from 'rxjs';

export class UnitConversionDatasource extends BaseDataSource {
     constructor(private service: UnitConversionService) {
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
