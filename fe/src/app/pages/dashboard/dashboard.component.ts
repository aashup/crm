import { 
  AfterViewInit, 
  ChangeDetectorRef, 
  Component, 
  ElementRef, 
  OnDestroy, 
  OnInit, 
  ViewChild 
} from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { DashboardService } from './dashboard.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { DashboardReportService } from './dashboard-report-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };

  search: any = { all: '', dateFilter: '', start_date: '', end_date: '' };
  subscriptionHandler = new SubscriptionHandler();

  @ViewChild('modal') private modalComponent: ModalComponent;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  graphDetails: any;

  constructor(
    private dashboardService: DashboardService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private reportService:DashboardReportService
  ) {}

  ngOnInit(): void {
    this.getDashboardDetails();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
   
  }

  get balance(): number {
    const gains = Number(this.graphDetails?.card?.expenses?.total_gains || 0);
    const expenses = Number(this.graphDetails?.card?.expenses?.total_expenses || 0);
    return gains - expenses;
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  onDateFilterChange(): void {
    if (this.search.dateFilter === 'custom') {
      this.search.start_date = '';
      this.search.end_date = '';
    } else {
      this.search.start_date = '';
      this.search.end_date = '';
      this.getDashboardDetails();
    }
  }

  downloadReport() {
    this.reportService.generateDummyReport();
  }
  

  onDateChange(): void {
    if (this.search.dateFilter === 'custom') {
      this.getDashboardDetails();
    }
  }

  getDashboardDetails(): void {
    this.spinnerService.show();
    const sub = this.dashboardService.find({
      interval: this.search.dateFilter !== 'custom' ? this.search.dateFilter : null,
      start_date: this.search.start_date,
      end_date: this.search.end_date,
    }).subscribe({
      next: (res: any) => {
        this.graphDetails = res?.data ?? {};
        console.log(this.graphDetails);
        
        this.cdr.detectChanges();
      },
      error: () => {
        this.commonService.toastr.error('Something went wrong');
      },
      complete: () => {
        this.spinnerService.hide();
        this.commonService.toastr.success('Data retrieved successfully!');
        console.log(this.graphDetails);
      }
    });

    this.subscriptionHandler.add(sub);
  }

  async openModal() {
    return await this.modalComponent.open();
  }
}
