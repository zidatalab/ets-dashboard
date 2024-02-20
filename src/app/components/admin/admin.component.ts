import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialog } from './components/addUserDialog';
import { UpdateUserDialog } from './components/updateUserDialog';
import { DeleteUserDialog } from './components/deleteUserDialog';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private dialog: MatDialog
  ) { }

  users: any;
  myRegform: any;
  myDataUploadform: any;
  addUser: boolean = false;
  newuser: any;
  addData: boolean = false;
  uploaderror: any;
  currentuser: any;
  usergroupoptions = ['kvuser'];
  selectedDataLevel = []
  displayedColumns = ['symbol', 'user', 'rights', 'group', 'actions']

  ngOnInit(): void {
    this.currentuser = this.auth.getUserDetails();
    this.updateUserList();
  }

  updateUserList() {
    this.api.getTypeRequest('users/').subscribe(data => { this.users = data; })
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialog, {})

    dialogRef.afterClosed().subscribe(result => {
      this.updateUserList()
    })
  }

  openUpdateUserDialog(user : any): void {
    const dialogRef = this.dialog.open(UpdateUserDialog, {
      data: user
    })

    dialogRef.afterClosed().subscribe(result => {
      this.updateUserList()
    })
  }

  openDeleteUserDialog(user : any): void {
    const dialogRef = this.dialog.open(DeleteUserDialog, {
      data: user
    })

    dialogRef.afterClosed().subscribe(result => {
      this.updateUserList()
    })
  }

  toUpperCase(value: string) {
    return value.toLocaleUpperCase()
  }

  fullName(value : any) {
    if (value.full_name) {
      return value.full_name
    }
    return `${value.anrede} ${value.firstname} ${value.lastname}`
  }
}
