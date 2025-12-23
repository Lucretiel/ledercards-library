/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, output } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { SearchService, type QueryDisplay, type QuerySort, type QuerySortDir } from '../../../search.service';
import { CardsService } from 'src/app/cards.service';

@Component({
  selector: 'app-search-cards',
  templateUrl: './search-cards.component.html',
  styleUrls: ['./search-cards.component.scss'],
})
export class SearchCardsComponent {
  public route = inject(ActivatedRoute);
  public searchService = inject(SearchService);
  public cardsService = inject(CardsService);
  public pageChanged = output<number>();

  public get queryString() {
    this.searchService.queryString()
    return new URLSearchParams(window.location.search).get('q');
  }

  public get loading() { return !this.cardsService.loaded }

  changePage(newPage: number) {
    this.searchService.changePage(newPage);
    this.pageChanged.emit(newPage);
  }

  public getDetailHeight(): any {
    return '100%';
  }

  public setDisplay(display: string): void {
    this.searchService.updateDisplay(display as QueryDisplay)
  }

  public setSort(sort: string): void {
    this.searchService.updateSort(sort as QuerySort)
  }

  public setDirection(dir: string): void {
    this.searchService.updateSortDir(dir as QuerySortDir)
  }
}
