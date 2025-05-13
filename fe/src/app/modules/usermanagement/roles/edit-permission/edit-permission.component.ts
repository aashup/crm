import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/core/common.service';
import { MenuService } from 'src/app/modules/settings/menu/menu.service';
import { PermissionService } from '../../permission/permission.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPermissionDialogComponent } from './add-permission-dialog/add-permission-dialog.component';
import { data } from 'jquery';
import { ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }
  searchQuery: string = '';
  selectAll: boolean = false;
  searchText: string = '';
  sections:any = []
  permissions:any=[]
  roleId:any
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

  copyText(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Copied to clipboard!'))
        .catch(err => console.error('Failed to copy text: ', err));
    } else {
      alert('Clipboard API not supported in this browser.');
    }
  }
  addNewPermission(section: any) {
    console.log(section);
    
    const dialogRef = this.dialog.open(AddPermissionDialogComponent, {
      width: '600px',
      height: 'auto',
      data: {
        menu_id: section.id
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {      
        this.getAllSections();  
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
    const permissionsPayload: { [menuId: string]: { [permissionId: string]: boolean } } = {};
  
    this.filteredSections().forEach((section: any) => {
      const menuId = section.id; 
      const selectedPermissions: { [permissionId: string]: boolean } = {};
  
      section.permissions.forEach((permission: any) => {
        if (section[permission.id]) {
          selectedPermissions[permission.id] = true;
        }
      });
  
     
      if (Object.keys(selectedPermissions).length > 0) {
        permissionsPayload[menuId] = selectedPermissions;
      }
    });
  
    console.log( permissionsPayload);
    this.permissionService.updateRolePermissions(this.roleId,permissionsPayload).subscribe((response: any) => {
      if (response.success) {
        alert('Permissions updated successfully');
      } else {
      }
    }, (error) => {
      console.error('Error updating permissions:', error);
    });
  }



  ngOnInit(): void {
    this.commonService.page.updateTitle('Role Permission Management (AHJ - Preplan)');
    this.roleId =this.route.snapshot.paramMap.get('id');

    this.getAllSections();
  }
  ngAfterViewInit(): void {
   
  }

}
