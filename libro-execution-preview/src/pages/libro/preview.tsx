import {
  view,
  singleton,
  BaseView,
  ViewInstance,
  useInject,
  inject,
  prop,
  ViewRender,
  ViewManager,
} from '@difizen/mana-app';
import { forwardRef, ReactElement } from 'react';
import { Button, Radio } from 'antd';

import {
  ArrowDown,
  ArrowRight,
  CellCollapsible,
  ExecutableCellView,
  LibroService,
  NotebookView,
  PlusOutlined,
} from '@difizen/libro-core';
import './index.less';

export const LibroExecutionPreviewComponent = forwardRef(
  function LibroExecutionPreviewComponent() {
    const instance = useInject<LibroExecutionPreviewView>(ViewInstance);

    if (!instance.libroView || !instance.libroView.view) {
      return null;
    }
    return (
      <div className="libro-app-container">
        <div className="libro-app-container-content">
          <div className="libro-app-cell-list">
            {instance.libroView?.model.cells.map((cell) => {
              if (cell.collapsedHidden) {
                return null;
              }
              if (ExecutableCellView.is(cell)) {
                return <ViewRender view={cell.outputArea} key={cell.id}></ViewRender>;
              } else {
                const isCollapsible = CellCollapsible.is(cell);
                return (
                  <>
                    {instance.libroView?.collapserVisible && isCollapsible && (
                      <div className="libro-app-cell-container">
                        <div
                          className="libro-markdown-collapser"
                          onClick={() => {
                            instance.libroView?.collapseCell(
                              cell,
                              !cell.headingCollapsed,
                            );
                          }}
                        >
                          {cell.headingCollapsed ? <ArrowRight /> : <ArrowDown />}
                        </div>
                        <ViewRender view={cell}></ViewRender>
                        {isCollapsible &&
                          cell.headingCollapsed &&
                          cell.collapsibleChildNumber > 0 && (
                            <div className="libro-cell-collapsed-expander">
                              <Button
                                className="libro-cell-expand-button"
                                onClick={() =>
                                  instance.libroView?.collapseCell(cell, false)
                                }
                                icon={<PlusOutlined className="" />}
                                type="default"
                              >
                                {cell.collapsibleChildNumber} cell hidden
                              </Button>
                            </div>
                          )}
                      </div>
                    )}
                  </>
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  },
);

@singleton()
@view('libro-execution-preview')
export class LibroExecutionPreviewView extends BaseView {
  @inject(ViewManager) viewManager: ViewManager;
  @inject(LibroService) libroService: LibroService;
  override view = LibroExecutionPreviewComponent;

  @prop()
  libroView: NotebookView | undefined;

  override async onViewMount() {
    this.libroView = await this.libroService.getOrCreateView({
      id: 'libro-execution-preview',
    });
  }
}
