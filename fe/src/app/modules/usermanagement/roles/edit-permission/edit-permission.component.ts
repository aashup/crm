import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/core/common.service';
import { MenuService } from 'src/app/modules/settings/menu/menu.service';
import { PermissionService } from '../../permission/permission.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPermissionDialogComponent } from './add-permission-dialog/add-permission-dialog.component';
import { data } from 'jquery';

@Component({
  selector: 'app-edit-permission',
  standalone: false,
  templateUrl: './edit-permission.component.html',
  styleUrl: './edit-permission.component.scss'
})
export class EditPermissionComponent implements AfterViewInit, OnInit {
  constructor(
    private commonService: CommonService,
    private menuService: MenuService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }
  searchQuery: string = '';
  selectAll: boolean = false;
  searchText: string = '';
  sections:any = []
  permissions:any=[]
  
getAllSections() {
    this.menuService.find({
      "with": ["permissions"],
      "cols": ["id", "name"]
  }).subscribe((response: any) => {
     
      this.sections = response.data;
      this.cdr.detectChanges()
      setTimeout(() => {}, 0); 

    });
  }
 getAllPermissions() {  
    this.permissionService.find({
     
  }).subscribe((response: any) => {
      console.log(response.data);
      this.permissions = response.data;
      this.cdr.detectChanges()
      setTimeout(() => {}, 0); 

    });
  }
  selectAllPermissions() {
 }
    


  filteredSections() {
    return this.sections.filter((section:any) =>
      section.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }


  addNewPermission(section: any) {
    const dialogRef = this.dialog.open(AddPermissionDialogComponent, {
      width: '600px',
      height: 'auto',
      data: {
        description: '',
        error: '',
        guard_name: 'web',
        menu_id: section.id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        
        section.permissions = section.permissions || [];
        section.permissions.push({ id: result, name: result });
      }
    });
  }
  resetPermissions() {
    this.sections.forEach((section:any) => {
      section.read = section.create = section.update = section.delete = false;
    });
  }

  saveChanges() {
    console.log('Saving permissions:', this.sections);
  }
  ngOnInit(): void {
    this.commonService.page.updateTitle('Role Permission Management (AHJ - Preplan)');
    this.getAllSections();
    this.getAllPermissions();
  }
  ngAfterViewInit(): void {
   
  }

}
