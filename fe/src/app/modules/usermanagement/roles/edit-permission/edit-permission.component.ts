import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/core/common.service';

@Component({
  selector: 'app-edit-permission',
  standalone: false,
  templateUrl: './edit-permission.component.html',
  styleUrl: './edit-permission.component.scss'
})
export class EditPermissionComponent implements AfterViewInit, OnInit {
  constructor(
    private commonService: CommonService,
  ) { }
  searchQuery: string = '';
  selectAll: boolean = false;
  searchText: string = '';
  sections = [
    { name: 'Dashboard', read: false, create: false, update: false, delete: false },
    { name: 'Premises', read: false, create: false, update: false, delete: false },
    { name: 'AHJ', read: false, create: false, update: false, delete: false },
    { name: 'Inspection Company', read: false, create: false, update: false, delete: false },
    { name: 'Deficiency List', read: false, create: false, update: false, delete: false },
    { name: 'Inspection Report', read: false, create: false, update: false, delete: false },
    { name: 'Users', read: false, create: false, update: false, delete: false }
  ];
  filteredSections() {
    return this.sections.filter(section =>
      section.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addNewPermission(section: any) {
    console.log('Add new permission for:', section.name);
  }

  resetPermissions() {
    this.sections.forEach(section => {
      section.read = section.create = section.update = section.delete = false;
    });
  }

  saveChanges() {
    console.log('Saving permissions:', this.sections);
  }
  ngOnInit(): void {
    this.commonService.page.updateTitle('Role Permission Management (AHJ - Preplan)');

  }
  ngAfterViewInit(): void {
  }

}
