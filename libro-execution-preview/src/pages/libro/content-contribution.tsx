import { ContentContribution } from '@difizen/libro-core';
import { singleton } from '@difizen/mana-app';
import qs from 'query-string';

@singleton({ contrib: [ContentContribution] })
export class PageContentContribition implements ContentContribution {
  canHandle = (options: Record<string, any>, model: any) => {
    return 100;
  };
  loadContent = async (options: Record<string, any>, model: any) => {
    // use qs parse to get the query string
    const query = qs.parse(window.location.search);
    // read notebook from query string
    if (query['notebook']) {
      const notebook = JSON.parse(decodeURIComponent(query['notebook'] as string));
      return Promise.resolve(notebook);
    }
    if ((window as any).notebook) {
      return (window as any).notebook;
    }
    return Promise.resolve({
      metadata: {},
      cells: [],
      nbformat: 4,
      nbformat_minor: 4,
    });
  };
}
