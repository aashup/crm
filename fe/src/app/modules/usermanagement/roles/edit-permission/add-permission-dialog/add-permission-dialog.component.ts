import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddPermissionComponent } from '../../../permission/add-permission/add-permission.component';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '../../../permission/permission.service';
import { CommonService } from 'src/app/modules/core/common.service';

@Component({
  selector: 'app-add-permission-dialog',
  templateUrl: './add-permission-dialog.component.html',
  styleUrls: ['./add-permission-dialog.component.scss']
})
export class AddPermissionDialogComponent {
  
  description: string = '';
  error: string = "";
  guard_name: string = 'web';
  menu_id: string = '';


  constructor(
    public dialogRef: MatDialogRef<AddPermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { menu_id: string },
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private commonService: CommonService,
  ) {
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      console.log("menu id : ",params);
      const id = params.get('id'); 
      if (id) {
        this.menu_id = id;
      }
    });
  }

  savePermission() {
    const payload = {
      description: this.description,
      guard_name: this.guard_name,  
      menu_id: this.data.menu_id,
    }
  
    if (this.description.trim() ) {
     console.log(payload);
     this.permissionService.create(payload).subscribe((response: any) => {
      this.dialogRef.close({ message: 'Permission created successfully' }); 
      this.commonService.toastr.success('Permission created successfully');
     },(error: any) => {
      this.error = error.error.message;
     })
        
    } else {
      this.error = this.description.trim() ? "Menu ID is required" : "Description is required";
    }
  }

  clearError() {
    this.error = ''; 
  }
}