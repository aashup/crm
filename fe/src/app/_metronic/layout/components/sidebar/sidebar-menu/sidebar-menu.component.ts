import { Component, OnInit } from '@angular/core';
import { SidebarMenuService } from 'src/app/shared/services/sidebar-menu.service';

@Component({
    selector: 'app-sidebar-menu',
    templateUrl: './sidebar-menu.component.html',
    styleUrls: ['./sidebar-menu.component.scss'],
    standalone: false
})
export class SidebarMenuComponent implements OnInit {

  constructor(public sidebarMenuService: SidebarMenuService) { }

  ngOnInit(): void {
    this.sidebarMenuService.menuList$.subscribe(menu => {
      console.log('Menu List:', menu);
    });
  }

}
