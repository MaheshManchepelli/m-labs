import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,  } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UserCardComponent {

  constructor(private cd : ChangeDetectorRef){
   
  }


@Input() user: any;
}
