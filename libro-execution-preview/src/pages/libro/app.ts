import { ApplicationContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: [ApplicationContribution] })
export class LibroApp implements ApplicationContribution {
  async onStart() {
    //
  }
}
