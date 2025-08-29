import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';

import { DashboardService } from './dashboard.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit{
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  graphDetails:any
  constructor(
    private dashboardService:DashboardService,
    private commonService:CommonService,
    private spinnerService:SpinnerService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getDashboardDetails()
  }
  ngAfterViewInit(): void {
    
  }
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
  getDashboardDetails() {
    this.spinnerService.show()
    this.dashboardService.find().subscribe({
      next: (res: any) => {
        this.graphDetails = res?.data ?? []
        this.cdr.detectChanges()
        this.spinnerService.hide()
      },
      error: (err) => {
        this.commonService.toastr.error("Something went wrong")
        this.spinnerService.hide()
      },
      complete: () => {
        this.commonService.toastr.success("data retrieved successfuly!")
        this.spinnerService.hide()
        console.log(this.graphDetails);
        
      }
    });
  }
  

  async openModal() {
    return await this.modalComponent.open();
  }
}
