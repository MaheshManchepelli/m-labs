import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  private apiKey = 'uI5y0Ew5A6MYIiVj79e6AajmuE2kWSrVf7GYpTXJ0813pLlCYIFASAuF';


  public fetchUsers(skip: number, limit: number, query: string) {
    let url = `https://dummyjson.com/users`;
     if (query) {
      url += `?q=${query}&skip=${skip}&limit=${limit}`;
     } else {
      url += `?skip=${skip}&limit=${limit}`;
     }
    return this.http.get(url);
  }

  fetchPhotos(page: number, perPage: number, query: string = '') {
    
    const endpoint = query ? 'search' : 'curated';
    
    let url = `https://api.pexels.com/v1/${endpoint}`;

    if (query) {
      url += `?query=${query}&page=${page}&per_page=${perPage}`;
    } else {
      url += `?page=${page}&per_page=${perPage}`;
    }

    const headers = new HttpHeaders({
      'Authorization': `${this.apiKey}`
    });

    return this.http.get<any>(url, { headers }).pipe(
      map(res => res.photos || [])
    );
  }


  getUser() {
    return this.http.get(`http://127.0.0.1:8000/users/`);
  }

  saveUser(user: any) {
    return this.http.post(`http://127.0.0.1:8000/users/`, user);
  }
}
