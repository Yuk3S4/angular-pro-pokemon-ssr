import { ApplicationRef, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { toSignal } from "@angular/core/rxjs-interop";

import { PokemonListComponent } from "../../pokemons/components/pokemon-list/pokemon-list.component";
import { PokemonsService } from '../../pokemons/services/pokemons.service';
import { SimplePokemon } from '../../pokemons/interfaces';
import { map, tap } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { PokemonListSkeletonComponent } from "./ui/pokemon-list-skeleton/pokemon-list-skeleton.component";

@Component({
  selector: 'pokemons-page',
  imports: [PokemonListComponent, PokemonListSkeletonComponent],
  templateUrl: './pokemons-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PokemonsPageComponent {

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private title = inject(Title)

  private pokemonsService = inject(PokemonsService)
  public pokemons = signal<SimplePokemon[]>([])

  public currentPage = toSignal<number>(
    this.route.queryParamMap.pipe(
      map( params => params.get('page') ?? '1' ),
      map( page => ( isNaN(+page) ? 1 : +page ) ),
      map( page => Math.max(1, page))
    )
  )

  // public isLoading = signal(true)

  // private appRef = inject(ApplicationRef)

  // private $appState = this.appRef.isStable.subscribe( isStable => {
  //   console.log(isStable);

  // })

  ngOnInit(): void {
    console.log(this.currentPage());


    this.loadPokemons()
    // setTimeout(() => {
    //   this.isLoading.set(false)
    // }, 5000);
  }

  public loadPokemons( page = 0 ) {

    const pageToLoad = this.currentPage()! + page

    this.pokemonsService.loadPage(pageToLoad)
      .pipe(
        tap(() => this.router.navigate([], { queryParams: { page: pageToLoad } })),
        tap( () => this.title.setTitle(`Pokemons SSR - Page ${ pageToLoad }`))
      )
      .subscribe( pokemons => {
        this.pokemons.set( pokemons )
      })
  }

}
