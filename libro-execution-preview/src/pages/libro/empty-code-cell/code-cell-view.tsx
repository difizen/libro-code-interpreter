/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { ICodeCell, IOutput } from '@difizen/libro-common';
import { isOutput } from '@difizen/libro-common';
import type {
  IOutputAreaOption,
  LibroCell,
  CellViewOptions,
} from '@difizen/libro-core';
import {
  CellService,
  EditorStatus,
  LibroEditableExecutableCellView,
  LibroOutputArea,
  VirtualizedManagerHelper,
} from '@difizen/libro-core';
import type { ViewSize } from '@difizen/mana-app';
import {
  getOrigin,
  inject,
  prop,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
  watch,
  Deferred,
} from '@difizen/mana-app';
import { useEffect, useRef, memo, forwardRef } from 'react';

import type { LibroCodeCellModel } from './code-cell-model.js';

const CellEditor: React.FC = () => {
  const instance = useInject<LibroCodeCellView>(ViewInstance);
  const virtualizedManagerHelper = useInject(VirtualizedManagerHelper);
  const virtualizedManager = virtualizedManagerHelper.getOrCreate(
    instance.parent.model,
  );
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);

  if (virtualizedManager.isVirtualized) {
    instance.renderEditorIntoVirtualized = true;
    if (instance.setEditorHost) {
      instance.setEditorHost(editorRef);
    }

    const editorAreaHeight = instance.calcEditorAreaHeight();

    return (
      <div
        style={{
          height: `${editorAreaHeight || 0}px`,
          width: '100%',
        }}
        ref={editorRef}
      />
    );
  } else {
    return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
  }
};

export const CellEditorMemo = memo(CellEditor);

const CodeEditorViewComponent = forwardRef<HTMLDivElement>(
  function CodeEditorViewComponent(props, ref) {
    const instance = useInject<LibroCodeCellView>(ViewInstance);

    return (
      <div
        className="libro-codemirror-cell-editor"
        ref={ref}
        tabIndex={10}
        onBlur={instance.blur}
      >
        <CellEditorMemo />
      </div>
    );
  },
);

@transient()
@view('code-editor-cell-view')
export class LibroCodeCellView extends LibroEditableExecutableCellView {
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  declare model: LibroCodeCellModel;

  outputs: IOutput[];

  @prop()
  editorAreaHeight = 0;

  @prop()
  override noEditorAreaHeight = 0;

  @prop()
  override cellViewTopPos = 0;

  @prop()
  override editorStatus: EditorStatus = EditorStatus.NOTLOADED;

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  override renderEditor = () => {
    if (this.editorView) {
      return <ViewRender view={this.editorView} />;
    }
    return null;
  };

  override onViewResize(size: ViewSize) {
    if (size.height) {
      this.editorAreaHeight = size.height;
    }
  }

  calcEditorAreaHeight() {
    return this.editorAreaHeight;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, cellService);
    this.options = options;
    this.viewManager = viewManager;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' code';

    // 创建outputArea
    this.viewManager
      .getOrCreateView<LibroOutputArea, IOutputAreaOption>(LibroOutputArea, {
        cellId: this.id,
        cell: this,
      })
      .then(async (outputArea) => {
        this.outputArea = outputArea;
        const output = this.outputs;
        if (isOutput(output)) {
          await this.outputArea.fromJSON(output);
        }
        this.outputAreaDeferred.resolve(outputArea);
        this.outputWatch();
        return;
      })
      .catch(console.error);
  }

  override outputWatch() {
    this.toDispose.push(
      watch(this.outputArea, 'outputs', () => {
        this.parent.model.onChange?.();
      }),
    );
  }

  override toJSON(): LibroCell {
    const meta = super.toJSON();
    return {
      ...meta,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

  override onViewMount() {
    this.createEditor();
  }

  setEditorHost(ref: React.RefObject<HTMLDivElement>) {}

  override clearExecution = () => {
    this.model.clearExecution();
    this.outputArea.clear();
  };
}
