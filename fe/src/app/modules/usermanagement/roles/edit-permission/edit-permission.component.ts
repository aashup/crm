import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/core/common.service';
import { MenuService } from 'src/app/modules/settings/menu/menu.service';
import { PermissionService } from '../../permission/permission.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPermissionDialogComponent } from './add-permission-dialog/add-permission-dialog.component';
import { data } from 'jquery';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../roles.service';

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
    private rolesService: RolesService,
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
  role:any
  roleId:any
  getRoles(roleId: any) {
    
    this.rolesService.showRole(roleId, { with: ['permissions'] }).subscribe(
    
      (response: any) => {
        if (response.status) {
          this.role = response.data;  
          this.sections.forEach((section: any) => {
            section.permissions.forEach((permission: any) => {
              const allowedPermission = this.role.permissions.find(
                (rolePermission: any) =>
                  rolePermission.id === permission.id && rolePermission.menu_id === section.id
              );
              section[permission.id] = !!allowedPermission; 
            });
          });
  
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Error fetching role:', error);
      }
    );
  }
  getAllSections(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.menuService.find({
        with: ['permissions'],
        cols: ['id', 'name']
      }).subscribe(
        (response: any) => {
          this.sections = response.data;
          this.cdr.detectChanges();
          resolve(); // Resolve the promise when sections are loaded
        },
        (error) => {
          console.error('Error fetching sections:', error);
          reject(error); // Reject the promise if there's an error
        }
      );
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

    
 toggleSelectAll(isChecked: boolean): void {
  this.selectAll = isChecked;
  this.sections.forEach((section:any) => {
    section.permissions.forEach((permission:any) => {
      section[permission.id] = isChecked;
    });
  });
}


  filteredSections() {
    return this.sections.filter((section:any) =>
      section.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  copyText(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => this.commonService.toastr.success('Copied to clipboard!'))
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
    this.getAllSections().then(() => {
      this.getRoles(this.roleId);
    }).catch((error) => {
      console.error('Error initializing component:', error);
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
  
    this.permissionService.updateRolePermissions(this.roleId,permissionsPayload).subscribe((response: any) => {
      if (response.status) {

        
        this.commonService.toastr.success('Permissions updated successfully');
        
        this.getAllSections().then(() => {
          this.getRoles(this.roleId);
        }).catch((error) => {
          console.error('Error initializing component:', error);
        });
       
      } else {
      }
    }, (error) => {
      console.error('Error updating permissions:', error);
    });
  }



  ngOnInit(): void {
    this.commonService.page.updateTitle('Role Permission Management (AHJ - Preplan)');
    this.roleId =this.route.snapshot.paramMap.get('id');
    this.getAllSections().then(() => {
      this.getRoles(this.roleId);
    }).catch((error) => {
      console.error('Error initializing component:', error);
    });
    
  }
  ngAfterViewInit(): void {
   
  }

}
