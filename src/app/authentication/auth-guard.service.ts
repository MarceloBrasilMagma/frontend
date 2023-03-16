import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { BehaviorSubject } from "rxjs";
import { AuthClient } from "../../../web-api-client"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtHelper: JwtHelperService,
        private router: Router,
        private authClient: AuthClient
    ) {
    }

    private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('jwt');
    }

    setLoggedIn(authenticated: boolean) {
        this.loggedIn.next(authenticated);
    }

    getPerfil() {
        const token: string = localStorage.getItem("jwt");
        let tokenDecodificado = this.jwtHelper.decodeToken(token);

        if (tokenDecodificado) {
            return tokenDecodificado.perfil;
        }

        return null;
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //TODO: Sometne para criação do projeto vazio
        //return true;

        try {
            const token = localStorage.getItem("jwt");
            if (token && !this.jwtHelper.isTokenExpired(token)) {
                // console.log(this.jwtHelper.decodeToken(token));
                return true;
            }
            // const isRefreshSuccess = await this.tryRefreshingTokens(token);
            // if (!isRefreshSuccess) {
            this.setLoggedIn(false);
            this.router.navigate(["authentication/login"], { queryParams: { returnUrl: state.url } });
            // }
            // return isRefreshSuccess;
            return false;
        } catch (error) {
            return false;
        }
    }

    // private async tryRefreshingTokens(token: string): Promise<boolean> {
    //     // Try refreshing tokens using refresh token
    //     const refreshToken: string = localStorage.getItem("refreshToken");
    //     const credentials = JSON.stringify({ accessToken: token, refreshToken: refreshToken });
    //     let isRefreshSuccess: boolean;

    //     try {

    //         const response = this.authClient.refresh(new TokenApiModel({
    //             accessToken: token,
    //             refreshToken: refreshToken
    //         })).toPromise();


    //         // If token refresh is successful, set new tokens in local storage.
    //         const newToken = (await response).accessToken;
    //         const newRefreshToken = (await response).refreshToken;
    //         localStorage.setItem("jwt", newToken);
    //         localStorage.setItem("refreshToken", newRefreshToken);
    //         isRefreshSuccess = true;
    //     }
    //     catch (ex) {
    //         isRefreshSuccess = false;
    //     }
    //     return isRefreshSuccess;
    // }
}
