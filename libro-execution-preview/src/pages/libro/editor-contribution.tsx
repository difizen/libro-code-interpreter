import {
  CodeEditorContribution,
  CodeEditorFactory,
  defaultConfig,
  EditorStateFactory,
} from '@difizen/libro-code-editor';
import { singleton } from '@difizen/mana-app';

export const stateFactory: EditorStateFactory = () => {
  return {
    toJSON: () => {
      return {};
    },
    dispose: () => {
      //
    },
    state: {},
  };
};

export const emptyEditorFactory: CodeEditorFactory = (...args) => {
  console.log(args);
  return {
    resizeToFit: () => {},
    setOption: () => {},
    onModalChange: () => {},
    focus: () => {},
  } as any;
};

@singleton({ contrib: [CodeEditorContribution] })
export class EmptyEditorContribution implements CodeEditorContribution {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(mime: string): number {
    return 1;
  }
  factory: CodeEditorFactory = emptyEditorFactory;
  stateFactory = stateFactory;
  defaultConfig = defaultConfig;
}
