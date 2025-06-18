import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
// const BODY_CLASSES = ['bgi-size-cover', 'bgi-position-center', 'bgi-no-repeat'];

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '<body[root]>',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    standalone: false
})
export class AuthComponent implements OnInit, OnDestroy,AfterViewInit {
  today: Date = new Date();
  private routerSubscription: Subscription;
  constructor(
    private titleService: Title,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.updateTitle(event.urlAfterRedirects);
    });
  }
  ngAfterViewInit(): void {
    this.routerSubscription = this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.updateTitle(event.urlAfterRedirects);
    });
  }
  updateTitle(url: string): void {
   
    const sanitizedUrl = url.split('?')[0]; 
    const path = sanitizedUrl.split('#')[0]; 
  
    if (path.includes('/login')) {
      this.titleService.setTitle('Login');
    } else if (path.includes('/registration')) {
      this.titleService.setTitle('Registration');
    } else {
      this.titleService.setTitle('Default Title'); 
    }
  }
  ngOnDestroy() {
    
  }
}
