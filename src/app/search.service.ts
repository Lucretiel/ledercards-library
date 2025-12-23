import { computed, effect, inject, Injectable, signal, untracked, type Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { parseInt, sortBy } from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';
import type { ICard } from '../../interfaces';
import { queryToText } from '../../search/search';
import { CardsService } from './cards.service';
import { LocaleService } from './locale.service';
import { toSignal } from '@angular/core/rxjs-interop';

export type QueryDisplay = 'images' | 'text';
export type QuerySort = keyof ICard;
export type QuerySortDir = 'asc' | 'desc';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cardsService = inject(CardsService);
  private storageService = inject(LocalStorageService);
  private localeService = inject(LocaleService);

  public visibleCards = computed(() => {
    const page = this.pageValue();

    return this.queriedCards().slice(
      page * this.cardsPerPage, (page + 1) * this.cardsPerPage
    )
  });
  public queryDesc = computed(
    () => queryToText(this.queryString(), this.queriedCards().length > 1)
  )
  public queryString = computed(
    () => this.urlQueryParams().get("q") ?? ""
  );

  public readonly cardsPerPage = 60;
  public queriedCards: Signal<ICard[]> = computed(
    () => {
      const locale = this.localeService.currentLocale();
      const cards = this.cardsService
        .searchCards(this.queryString())
        .filter(c => c.locale === locale);

      const sortedCards = sortBy(cards, this.sortValue);
      if (this.sortDirValue === "desc") {
        sortedCards.reverse()
      }

      return sortedCards
    }
  )

  public totalPages = computed(() => {
    const numCards = this.queriedCards().length;
    return numCards === 0 ? 0 : Math.ceil(numCards / this.cardsPerPage) - 1
  });
  // public pageValue = signal<number>(0);
  public pageValue = computed(
    () => parseInt(this.urlQueryParams().get("p") ?? "0", 10)
  );

  public displayCurrent = computed(
    () => this.pageValue() * this.cardsPerPage + 1
  );
  public displayTotal = computed(
    () => this.queriedCards().length
  );
  public displayMaximum = computed(
    () => Math.min(this.displayTotal(), (this.pageValue() + 1) * this.cardsPerPage)
  );

  private urlQueryParams = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap }
  );

  public queryDisplayValue = computed(
    () => this.urlQueryParams().get("d") as QueryDisplay | null
  );
  public querySortValue = computed(
    () => this.urlQueryParams().get("s") as QuerySort | null
  );
  public querySortDirValue = computed(
    () => this.urlQueryParams().get("b") as QuerySortDir | null
  );

  public get displayValue() { return this.queryDisplayValue() ?? 'images' }
  public get sortValue() { return this.querySortValue() ?? 'name' }
  public get sortDirValue() { return this.querySortDirValue() ?? 'asc' }

  search(query: string, changePage = true, setPage = -1) {
    if (changePage) {
      this.changePage(setPage >= 0 ? setPage : 0);
    }

    this.updateParams({ q: query })
  }

  changePage(newPage: number) {
    const totalPages = this.totalPages();

    const effectivePage = newPage < 0 ? 0 : totalPages < newPage ? totalPages : newPage;
    this.updateParams({ p: effectivePage })
  }

  updateDisplay(display: QueryDisplay) {
    this.updateParams({ d: display })
  }

  updateSort(sort: QuerySort) {
    this.updateParams({ s: sort })
  }

  updateSortDir(sortBy: QuerySortDir) {
    this.updateParams({ b: sortBy })
  }

  private updateParams(params: {
    q?: string,
    d?: QueryDisplay,
    s?: QuerySort,
    b?: QuerySortDir,
    p?: number
  }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
