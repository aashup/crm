import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { menuReinitialization } from 'src/app/_metronic/kt/kt-helpers';
import { AuthService, UserType } from 'src/app/modules/auth';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { TokenStorageService } from 'src/app/modules/core/token-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false,
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;
  subscriptionHandler = new SubscriptionHandler();
  itemClass: string = 'ms-1 ms-lg-3';
  user$: Observable<UserType>;
  loggedInUser: UserType;
  btnClass: string =
    'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';

  constructor(
    private authService: AuthService,
    private tokenService: TokenStorageService
  ) {}

  ngAfterViewInit(): void {
    menuReinitialization();
  }

  ngOnInit(): void {
    this.subscriptionHandler.subscribe = this.tokenService.userUpdated$.subscribe((user) => {
      this.user$ = of(user);
    });
    this.user$.subscribe((user) => {
      this.loggedInUser = user;
    });
  }
}
