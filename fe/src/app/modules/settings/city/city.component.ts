import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CityDatasource } from './city.datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { CityModel } from './city.model';
import _ from 'lodash';
import { CityService } from './city.service';
import { CommonService } from '../../core/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: CityDatasource;
  selection = new SelectionModel<CityModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();

  filter: any = {}
  displayableCol = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'select', style: { 'min-width': '50px' } },
    { ref: 'id', name: 'ID', style: { 'min-width': '80px', 'max-width': '80px' } },
    { ref: 'name', name: 'Name', style: { 'min-width': '250px' } },
    { ref: 'city', name: 'Address', style: { 'min-width': '250px' } },
    { ref: 'state', name: 'Jurisdiction', mutator: (item: { jurisdiction: any; }) => item.jurisdiction || '', style: { 'min-width': '200px' } },
  ]

  constructor(
    private cdr: ChangeDetectorRef,
    private service: CityService,

    private commonService: CommonService,
  ) {
    this.dataSource = new CityDatasource(this.service);
  }
  ngOnInit(): void {
    this.commonService.setTitle("City");
    this.loadData();
    console.log("DATE")
  }
  ngOnDestroy(): void {
    this.subscriptionHandler.unsubscribe();
  }
  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }

  loadData() {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
    this.filter.page = this.paginator.pageIndex + 1;
    this.filter.pageSize = this.paginator.pageSize;
    // this.filter.filter = JSON.stringify(this.search);
    this.filter.with = ["state.country"];
    this.dataSource.find(this.filter);
  }

  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: CityModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item: CityModel) {

  }
}
