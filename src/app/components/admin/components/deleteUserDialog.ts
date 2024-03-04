import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'deleteUserDialog',
  templateUrl: 'deleteUserDialog.html',
  styleUrls: ['./dialog.scss']
})

export class DeleteUserDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialog>,
    private api: ApiService,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) { }

  deletUser() {
    this.api.deleteUser(this.data).subscribe();
    this.dialogRef.close()
  }

  onNoClick(): void {
    this.dialogRef.close()
  }
}