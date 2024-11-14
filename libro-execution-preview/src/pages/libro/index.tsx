import { LibroModule } from '@difizen/libro-core';
import {
  createSlotPreference,
  ManaAppPreset,
  ManaComponents,
  ManaModule,
  RootSlotId,
} from '@difizen/mana-app';

import { LibroApp } from './app.js';
import './index.less';
import { LibroExecutionPreviewView } from './preview.js';
import { MarkdownCellModule } from '@difizen/libro-markdown-cell';
import { RawCellModule } from '@difizen/libro-raw-cell';
import {
  DisplayDataOutputModule,
  ErrorOutputModule,
  StreamOutputModule,
} from '@difizen/libro-output';
import { EmptyEditorContribution } from './editor-contribution.js';
import { PageContentContribition } from './content-contribution.js';
import { CodeCellModule } from './empty-code-cell/module.js';
import { PlotlyModule } from './plotly/module.js';

const BaseModule = ManaModule.create().register(
  LibroApp,
  LibroExecutionPreviewView,
  EmptyEditorContribution,
  PageContentContribition,
  createSlotPreference({ slot: RootSlotId, view: LibroExecutionPreviewView }),
);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro"
        asChild={true}
        modules={[
          ManaAppPreset,
          LibroModule,
          CodeCellModule,
          MarkdownCellModule,
          RawCellModule,
          StreamOutputModule,
          ErrorOutputModule,
          DisplayDataOutputModule,
          PlotlyModule,
          BaseModule,
        ]}
      />
    </div>
  );
};

export default App;
