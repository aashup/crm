import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { TokenStorageService } from 'src/app/modules/core/token-storage.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { SnackBarService } from 'src/app/modules/core/snack-bar.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
  styleUrls: ['./user-inner.component.scss'],
  standalone: false,
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class =
    `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  user$: Observable<UserType>;
  langs = languages;
  subscriptionHandler = new SubscriptionHandler();

  constructor(
    private auth: AuthService,
    private translationService: TranslationService,
    private tokenService: TokenStorageService,
    private toast: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.subscriptionHandler.subscribe = this.tokenService.userUpdated$.subscribe((user) => {
      this.user$ = of(user);
    });
    this.setLanguage(this.translationService.getSelectedLanguage());
  }

  logout() {
    this.auth.logout(this.user$).subscribe({
      next: () => {
        this.tokenService.clearToken();
        this.toast.success('Logout Successfully.');
        this.router.navigateByUrl('auth/login');
        this.titleService.setTitle('Login');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Logout error', err);
      },
    });
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionHandler.unsubscribe();
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Mandarin',
    flag: './assets/media/flags/china.svg',
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: './assets/media/flags/spain.svg',
  },
  {
    lang: 'ja',
    name: 'Japanese',
    flag: './assets/media/flags/japan.svg',
  },
  {
    lang: 'de',
    name: 'German',
    flag: './assets/media/flags/germany.svg',
  },
  {
    lang: 'fr',
    name: 'French',
    flag: './assets/media/flags/france.svg',
  },
];
