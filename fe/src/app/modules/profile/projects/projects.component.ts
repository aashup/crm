import { Component, OnInit } from '@angular/core';
import { IconUserModel } from '../../../_metronic/partials';
import { Observable, of } from 'rxjs';
import { AuthService, UserType } from '../../auth';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { TokenStorageService } from '../../core/token-storage.service';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    standalone: false
})
export class ProjectsComponent implements OnInit {
  // users1: Array<IconUserModel> = [
  //   { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
  //   { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
  //   { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  // ];

  // users2 = [
  //   { name: 'Alan Warden', initials: 'A', color: 'warning' },
  //   { name: 'Brian Cox', avatar: './assets/media/avatars/300-5.jpg' },
  // ];

  // users3 = [
  //   { name: 'Mad Masy', avatar: './assets/media/avatars/300-6.jpg' },
  //   { name: 'Cris Willson', avatar: './assets/media/avatars/300-1.jpg' },
  //   { name: 'Mike Garcie', initials: 'M', color: 'info' },
  // ];

  // users4 = [
  //   { name: 'Nich Warden', initials: 'N', color: 'warning' },
  //   { name: 'Rob Otto', initials: 'R', color: 'success' },
  // ];

  // users5 = [
  //   { name: 'Francis Mitcham', avatar: './assets/media/avatars/300-20.jpg' },
  //   { name: 'Michelle Swanston', avatar: './assets/media/avatars/300-7.jpg' },
  //   { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  // ];

  // users6 = [
  //   { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
  //   { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
  //   { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  // ];

  // users7 = [
  //   { name: 'Meloday Macy', avatar: './assets/media/avatars/300-2.jpg' },
  //   { name: 'Rabbin Watterman', initials: 'S', color: 'success' },
  // ];

  // users8 = [
  //   { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
  //   { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
  //   { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  // ];

  // users9 = [
  //   { name: 'Meloday Macy', avatar: './assets/media/avatars/300-2.jpg' },
  //   { name: 'Rabbin Watterman', initials: 'S', color: 'danger' },
  // ];

  user$: Observable<UserType>;
      subscriptionHandler = new SubscriptionHandler();
    
     loggedInUser: any;
     permsissions:any= [];
   constructor(
     private authservice: AuthService,
     private tokenService: TokenStorageService
   ) {}

   getUserDataFromLocalStorage(): any {
    const userData = localStorage.getItem('user-data');
    if (userData) {
      this.permsissions = JSON.parse(userData).permissions;
      return userData;
    } else {
      console.warn('No user data found in local storage.');
      return null;
    }
  }
 
   ngOnInit(): void {
       this.subscriptionHandler.subscribe = this.tokenService.userUpdated$.subscribe((user) => {
         this.user$ = of(user);
       });
       this.user$.subscribe((user) => {
         this.loggedInUser = user;
       });
       this.getUserDataFromLocalStorage()
     }
     
}
