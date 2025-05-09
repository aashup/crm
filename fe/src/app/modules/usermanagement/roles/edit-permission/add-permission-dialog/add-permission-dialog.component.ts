import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddPermissionComponent } from '../../../permission/add-permission/add-permission.component';

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
  ) {
  }

  savePermission() {
    console.log(this.dialogRef);
    if (this.description.trim() ) {
      this.dialogRef.close({ description: this.description, }); 
      alert(`Description: ${this.description}, Guard: ${this.guard_name},`);
    } else {
      this.error = this.description.trim() ? "Menu ID is required" : "Description is required";
    }
  }

  clearError() {
    this.error = ''; 
  }
}