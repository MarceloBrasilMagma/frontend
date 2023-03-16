import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter, map, startWith } from "rxjs/operators";
import { slideInAnimation } from 'src/app/route-animation';
import { IBreadcrumb } from "../../shared/interfaces/breadcrumb.type";
import { ThemeConstantService } from '../../shared/services/theme-constant.service';
@Component({
    selector: 'app-common-layout',
    templateUrl: './common-layout.component.html',
    animations: [
        slideInAnimation
    ]
})

export class CommonLayoutComponent {
    breadcrumbs$: Observable<IBreadcrumb[]>;
    contentHeaderDisplay: string;
    isFolded: boolean;
    isSideNavDark: boolean;
    isExpand: boolean;
    selectedHeaderColor: string;
    carregandoDados: boolean = false;

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private themeService: ThemeConstantService,
    ) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let child = this.activatedRoute.firstChild;
                while (child) {
                    if (child.firstChild) {
                        child = child.firstChild;
                    } else if (child.snapshot.data && child.snapshot.data['headerDisplay']) {
                        return child.snapshot.data['headerDisplay'];
                    } else {
                        return null;
                    }
                }
                return null;
            })
        ).subscribe((data: any) => {
            this.contentHeaderDisplay = data;
        });
    }

    ngOnInit() {
        this.breadcrumbs$ = this.router.events.pipe(
            startWith(new NavigationEnd(0, '/', '/')),
            filter(event => event instanceof NavigationEnd), distinctUntilChanged(),
            map(data => this.buildBreadCrumb(this.activatedRoute.root))
        );
        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
        this.themeService.selectedHeaderColor.subscribe(color => this.selectedHeaderColor = color);
        this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
    }

    private buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
        let label = '', path = '/', pathArray: string[] = [], parameters: string[] = [];

        if (route.routeConfig) {
            // if (route.routeConfig.data) {
            //     label = route.routeConfig.data['title'];
            //     path += route.routeConfig.path;
            //     if (path.includes(':id') === true) {
            //         const id = route.snapshot.paramMap.get('id');
            //         const url: string = route.snapshot.url.join('');
            //         path = path.replace(':id', id);
            //         label = label + '/' + id;
            //     }
            // }
            if (route.routeConfig.data) {
                label = route.routeConfig.data['title'];
                path += route.routeConfig.path;
                pathArray = path.split('/');
                pathArray.forEach(x => {
                    if (x.includes(':')) {
                        parameters.push(x.substring(1));
                    }
                    
                })
                parameters.forEach(x => {
                    const param = route.snapshot.paramMap.get(x);
                    const url: string = route.snapshot.url.join('');
                    path = path.replace(`:${x}`, param);
                    label = label + '/' + param;
                });
            }
        }
        // else {
        //     label = 'Pre-projetos';
        //     path += 'pre-projetos';
        // }
        
        const nextUrl = path ? `${url}${path}` : url;
        const breadcrumb = <IBreadcrumb>{
            label: label, url: nextUrl
        };

        const newBreadcrumbs = label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
        if (route.firstChild) {
            return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
        }
        return newBreadcrumbs;
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }
    
}
