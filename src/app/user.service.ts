import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from './app.constants';
import { User } from './user-list/model/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constant : Constants = new Constants();

  constructor(private http: HttpClient) { }

  public get(url: string, options?: any): Observable<User[]> {
    return this.http.get<User[]>(this.constant.API_ENDPOINT + url);
  }

  public create(url: string, data: any, options?: any): Observable<User> {
    return this.http.post<User>(this.constant.API_ENDPOINT + url, data);
  }

  public update(url: string, data: any): Observable<any> {
    return this.http.post(this.constant.API_ENDPOINT + url, data);
  }

  public delete(url: string, data: any, options?: any) {
    return this.http.post(this.constant.API_ENDPOINT + url, data, options);
  }

  public ToggleStatus(url: string, id: any) {
    return this.http.get(this.constant.API_ENDPOINT + url + id);
  }
}
