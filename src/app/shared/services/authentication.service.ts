import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../interfaces/user.type';
import { JwtHelperService } from '@auth0/angular-jwt';

const USER_AUTH_API_URL = '/api-url';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(
        private http: HttpClient,
        private jwtHelper: JwtHelperService,
    ) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get obterUsuarioLogado(): any {
        const token: string = localStorage.getItem("jwt");

        try {
            return this.jwtHelper.decodeToken(token);
        } catch (error) {
            console.log('Erro ao decodificar o token: ' + error);
        }
    }

    get loginUsuarioLogado(): string {
        const token: string = localStorage.getItem("jwt");
        let tokenDecodificado = this.jwtHelper.decodeToken(token);

        if (tokenDecodificado) {
            return tokenDecodificado.login;
        }

        return null;
    }


    login(username: string, password: string) {
        return this.http.post<any>(USER_AUTH_API_URL, { username, password })
            .pipe(map(user => {
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
