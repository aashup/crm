import { Component, OnInit } from '@angular/core';
import { AuthService, UserType } from '../auth';
import { Observable, of } from 'rxjs';
import { SubscriptionHandler } from '../core/subscription.handler';
import { TokenStorageService } from '../core/token-storage.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    standalone: false
})
export class ProfileComponent implements OnInit {
   user$: Observable<UserType>;
     subscriptionHandler = new SubscriptionHandler();
   
    loggedInUser: any;
  constructor(
    private authservice: AuthService,
    private tokenService: TokenStorageService
  ) {}

  ngOnInit(): void {
      this.subscriptionHandler.subscribe = this.tokenService.userUpdated$.subscribe((user) => {
        this.user$ = of(user);
      });
      this.user$.subscribe((user) => {
        console.log(user);
        this.loggedInUser = user;
      });
    }
}
