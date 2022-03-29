import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from './model/user.model';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { takeUntil } from 'rxjs';


const ELEMENT_DATA: User[] = [
  {id: 1, nric: "1", firstName: 'john', lastName: 'wills', middleName: "-", status:"New", isActive: true},
  {id: 2, nric: "2", firstName: 'mike', lastName: 'tyson', middleName: "-", status:"Active", isActive: true},
  {id: 3, nric: "3", firstName: 'micheal', lastName: 'jordan', middleName: "-", status:"New", isActive: true},
  {id: 4, nric: "4", firstName: 'rock', lastName: 'johnson', middleName: "-", status:"InActive", isActive: false},
  {id: 5, nric: "5", firstName: 'eddie', lastName: 'guererro', middleName: "-", status:"New", isActive: true},
  {id: 6, nric: "6", firstName: 'joe', lastName: 'boud', middleName: "-", status:"New", isActive: true},
  {id: 7, nric: "7", firstName: 'wover', lastName: 'wolf', middleName: "-", status:"New", isActive: true} 
];

export interface UserDialog{
  user:User
  allnric: string[]
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nric', 'firstName', 'lastName', 'middleName', 'status', 'toggle', 'edit' ];
  dataSource:  MatTableDataSource<User> = new MatTableDataSource<User>(ELEMENT_DATA);
  clickedRows = new Set<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private _userService: UserService, private ref: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator.pageSize = 15
    this.dataSource.sortingDataAccessor = (item, property) =>{
      if(property === 'firstName'){
        return item.firstName
      } else {
        return (item as IIndexable)[property]
      }
    }
  }

  ngOnInit(): void {
    this._userService.get("api/user/getall").subscribe(res =>{
      this.dataSource.data = res
    })    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onToggle(event: any, element: any){
    this._userService.ToggleStatus("api/user/ToggleStatus/", element.id).subscribe((res) =>{  
      debugger    
      var index = this.dataSource.data.findIndex(x=> x.id == element.id);
      this.dataSource.data[index].status= res as string;  
      this.ref.detectChanges()
    },
    (error) => {
      alert(error.error)
    });
  }


  editUser(user: User): void {    
    var nricArray: string[] = this.dataSource.data.map(x=>x.nric);
    nricArray.splice(nricArray.findIndex(x=> x === user.nric),1);

    const dialogRef = this.dialog.open(ManageUserDialogComponent, {
      disableClose: false,
      hasBackdrop : true,
      width: '750px',
      data: {user: user, allnric: nricArray},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.firstname){
        //call update api
        var status = this.dataSource.data.find(x=> x.id == result.id)?.status as string;
        var active = this.dataSource.data.find(x=> x.id == result.id)?.isActive as boolean;
        var user : User = {
          id : result.id,
          firstName : result.firstname,
          lastName : result.lastname,
          middleName : result.middlename,
          status : status,
          isActive: active,
          nric : result.nric,
        }
        this._userService.update("api/user/update", user).subscribe((res) =>{
          alert(res)
          var index = this.dataSource.data.findIndex(x=> x.id == user.id);
          this.dataSource.data[index]= user;


          this.ref.detectChanges();
        },
        (error) => {
          alert(error.error)
        });
      }
    });
  }

  newUser(): void {
    var nricArray: string[] = this.dataSource.data.map(x=>x.nric);
    const dialogRef = this.dialog.open(ManageUserDialogComponent, {
     disableClose: false,
      hasBackdrop : true,
      width: '750px',
      data: { allnric: nricArray}      
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.firstname){
          //call create api    
          
          var user : User = {
            id : Math.max.apply(Math, ELEMENT_DATA.map(function(o) { return o.id; })) + 1,
            firstName : result.firstname,
            lastName : result.lastname,
            middleName : result.middlename,
            status : "New",
            isActive: false,
            nric : result.nric,
          }
          var dataArr = this.dataSource.data;
          
          this._userService.create("api/user/create", user).subscribe(
            (res) =>{
            debugger
            alert("user created succesfully")
            dataArr.push(res);
            this.dataSource.data = dataArr;
            this.ref.detectChanges();
          },
           (error) =>{
             debugger
             alert(error.error)
           });                      
      }
    });
  }
}

export interface IIndexable {
  [key: string]: any;
}


@Component({
  selector: 'manage-user-dialog',
  templateUrl: 'manage-user-dialog.html',
})
export class ManageUserDialogComponent {
  form: FormGroup;
  nric: string ="";
  firstname  : string = ""
  lastname  : string = ""
  middlename  : string = ""
  id: number = 0
  allnric: string[] = []

  constructor(
    public dialogRef: MatDialogRef<ManageUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialog,private fb: FormBuilder
  ) {

    if(data.user?.firstName){
      this.nric = data.user.nric
      this.firstname = data.user.firstName
      this.lastname = data.user.lastName
      this.middlename = data.user.middleName
      this.id = data.user.id
    }
    this.allnric = data.allnric
    this.form = this.fb.group({
      nric: [null, [Validators.required, this.duplicateNricValidator.bind(this)]],
      firstname: [null, [Validators.required]],
      lastname: [null, [Validators.required]],
      middlename: [null, [Validators.required]]
    });
  }

  duplicateNricValidator(control: FormControl){
    let nric = control.value;
    if (nric && this.allnric.includes(nric)) {
      return {
        duplicateNric: {
          Nric: nric
        }
      }
    }
    return null;
  }

  saveUser(form: FormGroup){
    var result = {
      id: this.id,
      nric : this.nric,
      firstname : this.firstname,
      lastname : this.lastname,
      middlename : this.middlename,
    }
    this.dialogRef.close(result);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

 
}