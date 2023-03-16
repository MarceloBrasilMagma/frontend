import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthClient, LoginModel } from '../../../../web-api-client';
import { AuthGuard } from '../auth-guard.service';


@Component({
    template: '',
})

export class LoginInternoComponent implements OnInit {


    constructor(private fb: UntypedFormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authGuard: AuthGuard,
        private authClient: AuthClient,
        private notification: NzNotificationService,
        private jwtHelper: JwtHelperService
    ) {
    }

    ngOnInit(): void {
        var token = this.route.snapshot.queryParams.token;

        if (token) {
            localStorage.setItem("jwt", token);
            this.router.navigate(['/agendar']);
        }
    }
}