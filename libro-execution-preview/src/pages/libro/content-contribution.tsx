import { ContentContribution } from '@difizen/libro-core';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: [ContentContribution] })
export class PageContentContribition implements ContentContribution {
  canHandle = (options: Record<string, any>, model: any) => {
    console.log(options);
    return 100;
  };
  loadContent(options: Record<string, any>, model: any) {
    console.log((window as any).notebook);
    if ((window as any).notebook) {
      return (window as any).notebook;
    }
    return Promise.resolve({
      metadata: {},
      cells: [],
      nbformat: 4,
      nbformat_minor: 4,
    });
  }
}