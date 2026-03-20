import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const fadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    // 1. Set the container to relative and pages to absolute
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),

    // 2. Animate the new page in
    query(':enter', [
      animate('400ms ease-out', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);